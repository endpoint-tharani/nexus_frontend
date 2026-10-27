import api, { clearTokens } from "./axios";
import type {
  AcceptInvitePayload,
  AcceptStaffInvitePayload,
  ApiResponse,
  AuthResponse,
  ForgotPasswordPayload,
  LoginPayload,
  MessageResponse,
  RequestLoginOtpPayload,
  ResetPasswordPayload,
  SignupPayload,
  User,
  VerifyEmailPayload,
  VerifyLoginOtpPayload,
} from "../types";

export const login = (data: LoginPayload) =>
  api.post<AuthResponse>("/auth/login", data);

export const signup = (data: SignupPayload) =>
  api.post<ApiResponse<User>>("/auth/signup", data);

export const forgotPassword = (email: string) =>
  api.post<MessageResponse>("/auth/forgot-password", {
    email,
  } satisfies ForgotPasswordPayload);

export const resetPassword = (
  email: string,
  otp: string,
  newPassword: string
) =>
  api.post<MessageResponse>("/auth/reset-password", {
    email,
    otp,
    newPassword,
  } satisfies ResetPasswordPayload);

export const verifyEmail = (email: string, otp: string) =>
  api.post<MessageResponse>("/auth/verify-email", {
    email,
    otp,
  } satisfies VerifyEmailPayload);

export const sendVerificationEmail = (email: string) =>
  api.post<MessageResponse>("/auth/send-verification-email", { email });

// Staff accepts an emailed invite (token from the link) and sets a password.
// Public call — no auth header needed; returns a fresh token pair + user.
export const acceptStaffInvite = (data: AcceptStaffInvitePayload) =>
  api.post<AuthResponse>("/auth/accept-staff-invite", data);

// Generic (role-agnostic) invite acceptance — Part 3, Phase 10. Public call;
// returns a fresh token pair + user, exactly like the staff invite.
export const acceptInvite = (data: AcceptInvitePayload) =>
  api.post<AuthResponse>("/auth/accept-invite", data);

// --- passwordless OTP login (Part 3, Phase 9) ---
// Step 1: email a one-time login code.
export const requestLoginOtp = (email: string) =>
  api.post<MessageResponse>("/auth/request-login-otp", {
    email,
  } satisfies RequestLoginOtpPayload);

// Step 2: exchange the 6-digit code for a token pair + user.
export const verifyLoginOtp = (email: string, otp: string) =>
  api.post<AuthResponse>("/auth/verify-login-otp", {
    email,
    otp,
  } satisfies VerifyLoginOtpPayload);

export const logout = async () => {
  try {
    await api.post<MessageResponse>("/auth/logout");
  } finally {
    clearTokens();
  }
};
