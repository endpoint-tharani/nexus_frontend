import { useEffect } from "react";
import { useBranches } from "./useBranches";
import { useCompanyId } from "../shared/useCompanyId";
import { useBranchStore } from "../../store/branch.store";

export const useActiveBranch = () => {
  const companyId = useCompanyId();
  const { data: branches = [], isLoading } = useBranches();
  const selection = useBranchStore((state) => state.selection);
  const setSelection = useBranchStore((state) => state.setSelection);

  const savedBranchId =
    selection?.companyId === companyId ? selection?.branchId : undefined;
  const selectedBranchId = branches.some((branch) => branch.id === savedBranchId)
    ? savedBranchId ?? ""
    : branches[0]?.id ?? "";

  useEffect(() => {
    if (!companyId || isLoading || !selectedBranchId || savedBranchId === selectedBranchId) {
      return;
    }
    setSelection(companyId, selectedBranchId);
  }, [companyId, isLoading, savedBranchId, selectedBranchId, setSelection]);

  const selectBranch = (branchId: string) => {
    if (companyId && branches.some((branch) => branch.id === branchId)) {
      setSelection(companyId, branchId);
    }
  };

  return { branches, selectedBranchId, selectBranch, isLoading };
};
