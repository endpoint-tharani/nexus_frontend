import axios from "axios";
import type {
  AxiosError,
  AxiosInstance,
  InternalAxiosRequestConfig,
} from "axios";
import type { ApiErrorBody } from "../types";

const configuredApiUrl = import.meta.env.VITE_API_URL;
if (!import.meta.env.DEV && !configuredApiUrl) {
  throw new Error("VITE_API_URL must be set for production builds.");
}

export const API_BASE_URL: string = import.meta.env.DEV
  ? "/api"
  : configuredApiUrl;

const ACCESS_TOKEN_KEY = "accessToken";
const REFRESH_TOKEN_KEY = "refreshToken";

// Per-request guard so a refreshed request is only ever retried once.
interface RetryableRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

// Credential-verifying public endpoints own their own 401 semantics — a 401
// there means "bad credentials", never "expired access token", so the
// refresh-retry path must skip them (otherwise a wrong OTP/invite could trigger
// a pointless, potentially looping retry).
const NON_RETRYABLE_AUTH_PATHS = [
  "/auth/refresh-access-token",
  "/auth/login",
  "/auth/request-login-otp",
  "/auth/verify-login-otp",
  "/auth/accept-invite",
  "/auth/accept-staff-invite",
];

const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
});

// --- token helpers (exported so the auth/user modules share one source) ---
export const getAccessToken = (): string | null =>
  localStorage.getItem(ACCESS_TOKEN_KEY);

export const getRefreshToken = (): string | null =>
  localStorage.getItem(REFRESH_TOKEN_KEY);

export const setTokens = (accessToken: string, refreshToken?: string): void => {
  localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
  if (refreshToken) localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
};

export const clearTokens = (): void => {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem("auth-storage");
  localStorage.removeItem("module-storage");
  localStorage.removeItem("pendingCompanyName");
  try {
    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith("emp_docs_") || key.startsWith("dev:")) {
        localStorage.removeItem(key);
      }
    });
  } catch (e) {
    // Ignore storage access errors
  }
};

import { clearAppSession } from "../utils/logout";

// Wipe credentials and bounce to /login (guarded against redirect loops).
const forceLogout = (): void => {
  clearAppSession();
  if (window.location.pathname !== "/login") {
    window.location.href = "/login";
  }
};

// --- request: inject the bearer token ---
api.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// --- refresh single-flight + queue ---
// While one refresh is in flight, concurrent 401s park here and are replayed
// (or rejected) once the refresh settles — avoids a thundering herd of refreshes.
let isRefreshing = false;
let waiters: Array<(token: string | null) => void> = [];

const waitForRefresh = (): Promise<string | null> =>
  new Promise((resolve) => waiters.push(resolve));

const releaseWaiters = (token: string | null): void => {
  waiters.forEach((resolve) => resolve(token));
  waiters = [];
};

// Bare axios (no interceptors) so a 401 on refresh can't recurse into itself.
const requestNewAccessToken = async (): Promise<string | null> => {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return null;

  try {
    const { data } = await axios.post<{
      data?: { accessToken?: string; refreshToken?: string };
    }>(`${API_BASE_URL}/auth/refresh-access-token`, { refreshToken });

    const newAccessToken = data?.data?.accessToken;
    if (!newAccessToken) return null;

    setTokens(newAccessToken, data?.data?.refreshToken);
    return newAccessToken;
  } catch {
    return null;
  }
};

// Error bodies for blob requests (XLSX exports) arrive as a Blob even when the
// server returns JSON. Re-hydrate them so `getErrorMessage` can read the body.
const normalizeBlobError = async (error: AxiosError): Promise<AxiosError> => {
  const response = error.response;
  const body = response?.data;
  if (response && body instanceof Blob && body.type.includes("json")) {
    try {
      response.data = JSON.parse(await body.text());
    } catch {
      /* not JSON — leave the original blob in place */
    }
  }
  return error;
};

// --- response: 401 -> refresh -> retry once, else logout ---
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ApiErrorBody>) => {
    const originalRequest = error.config as RetryableRequestConfig | undefined;
    const status = error.response?.status;
    const url = originalRequest?.url ?? "";

    // Not a retryable auth failure: normalize blob bodies and reject.
    const isAuthEndpoint = NON_RETRYABLE_AUTH_PATHS.some((path) =>
      url.includes(path)
    );

    if (status !== 401 || !originalRequest || originalRequest._retry || isAuthEndpoint) {
      return Promise.reject(await normalizeBlobError(error));
    }

    originalRequest._retry = true;

    // A refresh is already running: wait for its result, then replay once.
    if (isRefreshing) {
      const token = await waitForRefresh();
      if (!token) return Promise.reject(error);
      originalRequest.headers.Authorization = `Bearer ${token}`;
      return api(originalRequest);
    }

    // Lead the refresh for this burst of 401s.
    isRefreshing = true;
    const newToken = await requestNewAccessToken();
    isRefreshing = false;
    releaseWaiters(newToken);

    if (!newToken) {
      forceLogout();
      return Promise.reject(error);
    }

    originalRequest.headers.Authorization = `Bearer ${newToken}`;
    return api(originalRequest);
  }
);

export default api;
