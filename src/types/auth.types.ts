// Domain + payload types for the Auth module
// (login, signup, password reset, email verification, token refresh).

import type { ApiResponse } from "./common.types";
import type { User } from "./user.types";
import type { ProductModule } from "../constants/modules";

// --- request payloads ---
export interface LoginPayload {
  email: string;
  password: string;
}

export interface SignupPayload {
  name: string;
  email: string;
  password: string;
}

export interface ForgotPasswordPayload {
  email: string;
}

export interface ResetPasswordPayload {
  email: string;
  otp: string;
  newPassword: string;
}

export interface VerifyEmailPayload {
  email: string;
  otp: string;
}

// Staff accepts an emailed invite: sets a password (and optionally a name),
// keyed by the single-use token from the invite link. Returns a token pair +
// user, exactly like login. ASSUMPTION on the `name` field being accepted.
export interface AcceptStaffInvitePayload {
  token: string;
  password: string;
  name?: string;
}

// Generic invite acceptance (Part 3, Phase 10) — same token-set-password flow
// as the staff invite but against the role-agnostic `/auth/accept-invite`
// endpoint. Kept as its own type so the two flows can diverge later.
export interface AcceptInvitePayload {
  token: string;
  password: string;
  name?: string;
}

export interface SendVerificationEmailPayload {
  email: string;
}

// Passwordless login (Part 3, Phase 9): request a one-time code by email, then
// exchange the 6-digit code for a token pair.
export interface RequestLoginOtpPayload {
  email: string;
}

export interface VerifyLoginOtpPayload {
  email: string;
  otp: string;
}

// --- auth results ---
export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

// Returned by login: the authenticated user + a fresh token pair. The backend may
// also include the company's enabled modules here (Module Access Control), which
// seeds the dynamic shell immediately on sign-in.
export interface AuthResult extends AuthTokens {
  user: User;
  ipAddress?: string;
  deviceName?: string;
  enabledModules?: ProductModule[];
}

// Refresh endpoint returns at least a new access token; it may rotate the
// refresh token too.
export interface RefreshResult {
  accessToken: string;
  refreshToken?: string;
}

// --- responses ---
export type AuthResponse = ApiResponse<AuthResult>;
export type RefreshResponse = ApiResponse<RefreshResult>;
