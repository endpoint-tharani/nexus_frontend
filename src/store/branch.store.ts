import { create } from "zustand";
import { persist } from "zustand/middleware";

interface BranchSelection {
  companyId: string;
  branchId: string;
}

interface BranchState {
  selection: BranchSelection | null;
  setSelection: (companyId: string, branchId: string) => void;
  createRequested: boolean;
  requestBranchCreate: () => void;
  clearBranchCreateRequest: () => void;
}

export const useBranchStore = create<BranchState>()(
  persist(
    (set) => ({
      selection: null,
      setSelection: (companyId, branchId) =>
        set({ selection: { companyId, branchId } }),
      createRequested: false,
      requestBranchCreate: () => set({ createRequested: true }),
      clearBranchCreateRequest: () => set({ createRequested: false }),
    }),
    {
      name: "active-branch-storage",
      partialize: (state) => ({ selection: state.selection }),
    },
  ),
);
