import { useQuery } from "@tanstack/react-query";
import { listBranches } from "../../api/branch.api";
import { queryKeys } from "../../constants/queryKeys";
import type { Branch } from "../../types";
import { useCompanyId } from "../shared/useCompanyId";
import type { QueryConfig } from "../shared/types";
import { useAuthStore } from "../../store/auth.store";
import { useMe } from "../user";
import { CompanyRole } from "../../constants/enums";

// Active branches for the active company, unwrapped to a plain array for branch
// pickers / filters. Tolerates either a `{ items }` payload (the documented
// contract) or a raw array, so the dropdown never silently renders empty.
export const useBranches = (
  options?: QueryConfig<Branch[]> & { branchId?: string }
) => {
  const companyId = useCompanyId();
  const persistedUser = useAuthStore((state) => state.user);
  const { data: currentUser, isLoading: isUserLoading } = useMe();
  const role = currentUser?.role ?? persistedUser?.role;
  const assignedBranchId = currentUser?.branchId ?? persistedUser?.branchId;
  const { branchId: requestedBranchId, ...queryOptions } = options ?? {};
  const branchId = requestedBranchId ?? assignedBranchId ?? undefined;
  const requiresBranchScope =
    role === CompanyRole.BRANCH_ADMIN || role === CompanyRole.DEPARTMENT_ADMIN;

  return useQuery({
    ...queryOptions,
    queryKey: queryKeys.branches.list(companyId ?? "", branchId),
    queryFn: async () => {
      const res = await listBranches({
        companyId: companyId ?? "",
        pageSize: 200,
        branchId: branchId ?? undefined,
      });
      const data = res.data.data as Branch[] | { items?: Branch[] };
      return Array.isArray(data) ? data : data?.items ?? [];
    },
    enabled:
      !!companyId &&
      !isUserLoading &&
      role !== undefined &&
      (!requiresBranchScope || !!branchId) &&
      (queryOptions.enabled ?? true),
  });
};
