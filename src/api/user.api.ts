import api, { clearTokens } from "./axios";
import type {
  ChangePasswordPayload,
  MessageResponse,
  SessionListResponse,
  UpdateProfilePayload,
  UserResponse,
} from "../types";

export const getMe = () => api.get<UserResponse>("/user/me");

export const updateMe = (data: UpdateProfilePayload) =>
  api.put<UserResponse>("/user/update-me", data);

export const getActiveSessions = () =>
  api.get<SessionListResponse>("/user/get-active-sessions");

export const revokeSession = (sessionId: string) =>
  api.post<MessageResponse>("/user/revoke-session", { sessionId });

export const logoutAllDevices = async () => {
  try {
    return await api.post<MessageResponse>("/auth/logout-all-devices");
  } finally {
    clearTokens();
  }
};

export const changePassword = (data: ChangePasswordPayload) =>
  api.post<MessageResponse>("/user/change-password", data);

export const deleteMe = (password: string) =>
  api.post<MessageResponse>("/user/delete-me", { password });
