import { useBranches } from "./useBranches";
import { useCompanyId } from "../shared/useCompanyId";
import { useBranchStore } from "../../store/branch.store";

export const useActiveBranch = () => {
  const companyId = useCompanyId();
  const query = useBranches();
  const { data: branches = [], isLoading } = query;
  const selection = useBranchStore((state) => state.selection);
  const setSelection = useBranchStore((state) => state.setSelection);

  const savedBranchId =
    selection?.companyId === companyId ? selection?.branchId : undefined;
  const selectedBranchId = branches.some((branch) => branch.id === savedBranchId)
    ? savedBranchId ?? ""
    : "";

  const selectBranch = (branchId: string) => {
    if (companyId && branches.some((branch) => branch.id === branchId)) {
      setSelection(companyId, branchId);
    }
  };

  return { branches, selectedBranchId, selectBranch, isLoading, error: query.error, refetch: query.refetch };
};
