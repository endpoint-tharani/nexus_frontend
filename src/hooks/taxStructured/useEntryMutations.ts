import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteTaxEntry, upsertTaxEntry } from "../../api/taxStructured.api";
import { upsertTaxEntryAdmin, deleteTaxEntryAdmin } from "../../api/tax.api";
import { queryKeys } from "../../constants/queryKeys";
import type {
  EmployeeStructuredDeclaration,
  UpsertEntryPayload,
} from "../../types";
import { requireCompanyId, useCompanyId } from "../shared/useCompanyId";

export interface UpsertEntryArgs {
  year: number;
  payload: UpsertEntryPayload;
}

// Create/update one structured entry (House Property property, Other Sources
// row, …). The mutation returns the freshly-recomputed declaration; we
// invalidate the structured cache so salary/computation update live.
export const useUpsertTaxEntry = (declarationId?: string) => {
  const queryClient = useQueryClient();
  const companyId = useCompanyId();

  return useMutation<EmployeeStructuredDeclaration, Error, UpsertEntryArgs>({
    mutationFn: async ({ year, payload }) => {
      const cid = requireCompanyId(companyId);
      if (declarationId) {
        const res = await upsertTaxEntryAdmin(cid, declarationId, year, payload);
        return res.data.data;
      } else {
        const res = await upsertTaxEntry(cid, year, payload);
        return res.data.data;
      }
    },
    onSuccess: () => {
      if (!companyId) return;
      if (declarationId) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.tax.declaration(companyId, declarationId),
        });
      } else {
        queryClient.invalidateQueries({
          queryKey: queryKeys.myTaxStructured.all(companyId),
        });
        // Keep the legacy "Declaration & Proofs" tab / cards in sync too.
        queryClient.invalidateQueries({
          queryKey: queryKeys.myTax.all(companyId),
        });
      }
    },
  });
};

export interface DeleteEntryArgs {
  year: number;
  entryId: string;
}

export const useDeleteTaxEntry = (declarationId?: string) => {
  const queryClient = useQueryClient();
  const companyId = useCompanyId();

  return useMutation<EmployeeStructuredDeclaration, Error, DeleteEntryArgs>({
    mutationFn: async ({ year, entryId }) => {
      const cid = requireCompanyId(companyId);
      if (declarationId) {
        const res = await deleteTaxEntryAdmin(cid, declarationId, year, entryId);
        return res.data.data;
      } else {
        const res = await deleteTaxEntry(cid, year, entryId);
        return res.data.data;
      }
    },
    onSuccess: () => {
      if (!companyId) return;
      if (declarationId) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.tax.declaration(companyId, declarationId),
        });
      } else {
        queryClient.invalidateQueries({
          queryKey: queryKeys.myTaxStructured.all(companyId),
        });
        // Keep the legacy "Declaration & Proofs" tab / cards in sync too.
        queryClient.invalidateQueries({
          queryKey: queryKeys.myTax.all(companyId),
        });
      }
    },
  });
};
