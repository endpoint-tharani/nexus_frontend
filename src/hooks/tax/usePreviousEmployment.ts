import { useMutation, useQuery, useQueryClient, QueryClient } from "@tanstack/react-query";
import {
  getMyPreviousEmployments,
  createPreviousEmployment,
  updatePreviousEmployment,
  submitPreviousEmployment,
  uploadPreviousEmploymentFile,
  getEmployeePreviousEmployments,
  listPreviousEmployments,
  createPreviousEmploymentAdmin,
  updatePreviousEmploymentAdmin,
  approvePreviousEmployment,
  rejectPreviousEmployment,
  deletePreviousEmploymentAdmin,
} from "../../api/previousEmployment.api";
import { queryKeys } from "../../constants/queryKeys";
import { useCompanyId } from "../shared/useCompanyId";
import type { PreviousEmployment } from "../../types";

const invalidateTaxAndPreviousEmployment = (
  queryClient: QueryClient,
  companyId: string | null | undefined,
  employeeId?: string
) => {
  queryClient.invalidateQueries({ queryKey: ["myPreviousEmployments"] });
  queryClient.invalidateQueries({ queryKey: ["listPreviousEmployments"] });
  if (companyId) {
    queryClient.invalidateQueries({ queryKey: queryKeys.myTaxStructured.all(companyId) });
    queryClient.invalidateQueries({ queryKey: queryKeys.myTax.all(companyId) });
    queryClient.invalidateQueries({ queryKey: queryKeys.tax.all(companyId) });
    
    if (employeeId) {
      queryClient.invalidateQueries({
        queryKey: ["employeePreviousEmployments", companyId, employeeId],
      });
    } else {
      queryClient.invalidateQueries({
        queryKey: ["employeePreviousEmployments", companyId],
      });
    }
  } else {
    queryClient.invalidateQueries({ queryKey: ["employeePreviousEmployments"] });
  }
};

// Employee Hooks
export const useMyPreviousEmployments = (year?: number) => {
  const companyId = useCompanyId();
  return useQuery<PreviousEmployment[], Error>({
    queryKey: ["myPreviousEmployments", companyId, year],
    queryFn: async () => {
      if (!companyId) return [];
      const res = await getMyPreviousEmployments(companyId, year);
      return res.data.data;
    },
    enabled: !!companyId,
  });
};

export const useCreatePreviousEmployment = () => {
  const queryClient = useQueryClient();
  const companyId = useCompanyId();

  return useMutation<PreviousEmployment, Error, Parameters<typeof createPreviousEmployment>[1]>({
    mutationFn: async (data) => {
      if (!companyId) throw new Error("No active company ID");
      const res = await createPreviousEmployment(companyId, data);
      return res.data.data;
    },
    onSuccess: () => {
      invalidateTaxAndPreviousEmployment(queryClient, companyId);
    },
  });
};

export const useUpdatePreviousEmployment = () => {
  const queryClient = useQueryClient();
  const companyId = useCompanyId();

  return useMutation<
    PreviousEmployment,
    Error,
    { id: string; data: Parameters<typeof updatePreviousEmployment>[2] }
  >({
    mutationFn: async ({ id, data }) => {
      if (!companyId) throw new Error("No active company ID");
      const res = await updatePreviousEmployment(companyId, id, data);
      return res.data.data;
    },
    onSuccess: () => {
      invalidateTaxAndPreviousEmployment(queryClient, companyId);
    },
  });
};

export const useSubmitPreviousEmployment = () => {
  const queryClient = useQueryClient();
  const companyId = useCompanyId();

  return useMutation<PreviousEmployment, Error, string>({
    mutationFn: async (id) => {
      if (!companyId) throw new Error("No active company ID");
      const res = await submitPreviousEmployment(companyId, id);
      return res.data.data;
    },
    onSuccess: () => {
      invalidateTaxAndPreviousEmployment(queryClient, companyId);
    },
  });
};

export const useUploadPreviousEmploymentFile = () => {
  const companyId = useCompanyId();

  return useMutation<{ key?: string; fileKey?: string; sourceFileKey?: string }, Error, File>({
    mutationFn: async (file) => {
      if (!companyId) throw new Error("No active company ID");
      const res = await uploadPreviousEmploymentFile(companyId, file);
      return res.data.data;
    },
  });
};

// Admin Hooks
export const useEmployeePreviousEmployments = (employeeId: string, year?: number) => {
  const companyId = useCompanyId();
  return useQuery<PreviousEmployment[], Error>({
    queryKey: ["employeePreviousEmployments", companyId, employeeId, year],
    queryFn: async () => {
      if (!companyId || !employeeId) return [];
      const res = await getEmployeePreviousEmployments(companyId, employeeId, year);
      return res.data.data;
    },
    enabled: !!companyId && !!employeeId,
  });
};

export const useListPreviousEmployments = (filters: Parameters<typeof listPreviousEmployments>[1]) => {
  const companyId = useCompanyId();
  return useQuery<PreviousEmployment[], Error>({
    queryKey: ["listPreviousEmployments", companyId, filters],
    queryFn: async () => {
      if (!companyId) return [];
      const res = await listPreviousEmployments(companyId, filters);
      return res.data.data;
    },
    enabled: !!companyId,
  });
};

export const useCreatePreviousEmploymentAdmin = () => {
  const queryClient = useQueryClient();
  const companyId = useCompanyId();

  return useMutation<PreviousEmployment, Error, Parameters<typeof createPreviousEmploymentAdmin>[1]>({
    mutationFn: async (data) => {
      if (!companyId) throw new Error("No active company ID");
      const res = await createPreviousEmploymentAdmin(companyId, data);
      return res.data.data;
    },
    onSuccess: (_, variables) => {
      invalidateTaxAndPreviousEmployment(queryClient, companyId, variables.employeeId);
    },
  });
};

export const useUpdatePreviousEmploymentAdmin = () => {
  const queryClient = useQueryClient();
  const companyId = useCompanyId();

  return useMutation<
    PreviousEmployment,
    Error,
    { id: string; employeeId: string; data: Parameters<typeof updatePreviousEmploymentAdmin>[2] }
  >({
    mutationFn: async ({ id, data }) => {
      if (!companyId) throw new Error("No active company ID");
      const res = await updatePreviousEmploymentAdmin(companyId, id, data);
      return res.data.data;
    },
    onSuccess: (_, variables) => {
      invalidateTaxAndPreviousEmployment(queryClient, companyId, variables.employeeId);
    },
  });
};

export const useApprovePreviousEmployment = () => {
  const queryClient = useQueryClient();
  const companyId = useCompanyId();

  return useMutation<PreviousEmployment, Error, { id: string; employeeId: string }>({
    mutationFn: async ({ id }) => {
      if (!companyId) throw new Error("No active company ID");
      const res = await approvePreviousEmployment(companyId, id);
      return res.data.data;
    },
    onSuccess: (_, variables) => {
      invalidateTaxAndPreviousEmployment(queryClient, companyId, variables.employeeId);
    },
  });
};

export const useRejectPreviousEmployment = () => {
  const queryClient = useQueryClient();
  const companyId = useCompanyId();

  return useMutation<PreviousEmployment, Error, { id: string; employeeId: string; reason: string }>({
    mutationFn: async ({ id, reason }) => {
      if (!companyId) throw new Error("No active company ID");
      const res = await rejectPreviousEmployment(companyId, id, reason);
      return res.data.data;
    },
    onSuccess: (_, variables) => {
      invalidateTaxAndPreviousEmployment(queryClient, companyId, variables.employeeId);
    },
  });
};

export const useDeletePreviousEmploymentAdmin = () => {
  const queryClient = useQueryClient();
  const companyId = useCompanyId();

  return useMutation<null, Error, { id: string; employeeId: string }>({
    mutationFn: async ({ id }) => {
      if (!companyId) throw new Error("No active company ID");
      const res = await deletePreviousEmploymentAdmin(companyId, id);
      return res.data.data;
    },
    onSuccess: (_, variables) => {
      invalidateTaxAndPreviousEmployment(queryClient, companyId, variables.employeeId);
    },
  });
};
