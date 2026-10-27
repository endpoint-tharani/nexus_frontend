import api from "./axios";
import type {
  BranchListParams,
  BranchListResponse,
  BranchPayload,
  BranchResponse,
  MessageResponse,
} from "../types";

// Branches are organization-scoped; `companyId` is the existing API's
// organization identifier.
export const listBranches = (
  params: BranchListParams & { companyId: string }
) => api.get<BranchListResponse>("/branch/list-branches", { params });

export const createBranch = (companyId: string, data: BranchPayload) =>
  api.post<BranchResponse>("/branch/create-branch", data, {
    params: { companyId },
  });

export const updateBranch = (
  id: string,
  companyId: string,
  data: BranchPayload
) =>
  api.patch<BranchResponse>("/branch/update-branch", data, {
    params: { id, companyId },
  });

export const deleteBranch = (id: string, companyId: string) =>
  api.delete<MessageResponse>("/branch/delete-branch", {
    params: { id, companyId },
  });
