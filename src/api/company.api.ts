import api from "./axios";
import type {
  CompanyResponse,
  CreateCompanyPayload,
  InviteStaffPayload,
  InviteStaffResponse,
  MessageResponse,
  UpdateCompanyPayload,
} from "../types";

export const createCompany = (data: CreateCompanyPayload) =>
  api.post<CompanyResponse>("/company/create-company", data);

export const getCompany = (companyId: string) =>
  api.get<CompanyResponse>("/company/get-company", {
    params: { companyId },
  });

export const updateCompany = (
  companyId: string,
  data: UpdateCompanyPayload
) =>
  api.patch<CompanyResponse>("/company/update-company", data, {
    params: { companyId },
  });

export const deleteCompany = (companyId: string) =>
  api.delete<MessageResponse>("/company/delete-company", {
    params: { companyId },
  });

// --- Team / staff (owner-only: backend verifyCompanyRootAccess) ----------
// There is NO "list staff" endpoint: the team is derived from the `users`
// embedded in GET /company/get-company (see `useStaff`). Invite is owner-only.
export const inviteStaff = (companyId: string, data: InviteStaffPayload) =>
  api.post<InviteStaffResponse>("/company/invite-staff", data, {
    params: { companyId },
  });

// Remove a staff member (ADMIN / HR) from the company — detaches their account
// and revokes access. Owner-only; the owner cannot be removed.
//
// BACKEND NOT YET IMPLEMENTED: this route does not exist on the PayRoll backend
// yet (the company module only has create/get/update/delete-company +
// invite-staff). The contract here is chosen to MATCH those routes so it drops
// in cleanly when added: DELETE, owner-gated (verifyCompanyRootAccess),
// companyId + userId as query params, and a plain { message } envelope. Until
// the route exists the call will 404 — wired ahead of the backend by design.
export const removeStaff = (companyId: string, userId: string) =>
  api.delete<MessageResponse>("/company/remove-staff", {
    params: { companyId, userId },
  });
