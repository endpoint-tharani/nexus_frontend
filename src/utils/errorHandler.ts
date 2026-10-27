// Normalizes the API error envelope ({ message } / { error: { message } }) into
// user-facing copy. Typed against `unknown` so callers can pass a raw catch value.

interface ApiErrorShape {
  response?: {
    status?: number;
    data?: { message?: string; error?: { message?: string } };
  };
  message?: string;
  // axios stamps this on its own errors; absent on app-thrown Errors.
  isAxiosError?: boolean;
}

const asApiError = (err: unknown): ApiErrorShape =>
  typeof err === "object" && err !== null ? (err as ApiErrorShape) : {};

// The raw backend message (untransformed) — for callers that need to branch on
// the exact text, e.g. detecting "Email not verified".
export const getApiErrorMessage = (err: unknown): string => {
  const e = asApiError(err);
  return e.response?.data?.error?.message || e.response?.data?.message || "";
};

export const getErrorMessage = (err: unknown): string => {
  const e = asApiError(err);
  const status = e.response?.status;
  const message = getApiErrorMessage(err);

  if (message.includes("Invalid or expired OTP")) {
    return "The verification code is invalid or has expired. Please request a new code.";
  }

  if (message.includes("Email not verified")) {
    return "Your email address has not been verified.";
  }

  if (status === 400) {
    return message || "The submitted information is invalid.";
  }

  if (status === 401) {
    return "Authentication failed. Please sign in again.";
  }

  if (status === 403) {
    return "Access denied.";
  }

  if (status === 404) {
    return "Requested resource not found.";
  }

  if (status === 409) {
    return "This record already exists.";
  }

  if (status === 429) {
    return "Too many requests. Please try again later.";
  }

  if (status !== undefined && status >= 500) {
    return "Server error. Please try again later.";
  }

  // App-thrown errors (e.g. `requireCompanyId` when no company is selected) are
  // not HTTP failures and carry no response/status — surface their own message
  // instead of the generic fallback so the user can see what actually blocked.
  if (!e.isAxiosError && status === undefined && e.message) {
    return e.message;
  }

  if (!navigator.onLine) {
    return "No internet connection.";
  }

  return "Something went wrong. Please try again.";
};
