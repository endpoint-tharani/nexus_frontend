import { createContext, useContext, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { salaryImportService } from "../../services/payroll/salaryImport.service";
import { queryKeys } from "../../constants/queryKeys";
import { useCompanyId } from "../shared/useCompanyId";
import { useDeletePayrollEntry } from "./useDeletePayrollEntry";
import type { PayrollRun, PayrollEntry, SalaryImportType } from "../../types";
import type { QueryConfig } from "../shared/types";
import { toNumber } from "../../utils/format";

export interface SalaryImportDetailsState {
  run: PayrollRun | undefined;
  isLoading: boolean;
  isError: boolean;
  refetch: () => void;
  isSalary: boolean;
  type: SalaryImportType;
  allComponents: {
    earnings: Array<{ code: string; name: string }>;
    deductions: Array<{ code: string; name: string }>;
  };
  parsedRemarks: any;
  entryTotals: (entry: PayrollEntry) => { gross: number; deductions: number; net: number };
  deleteEntryMutation: ReturnType<typeof useDeletePayrollEntry>;
  
  // Search and Pagination
  search: string;
  setSearch: (search: string) => void;
  page: number;
  setPage: (page: number) => void;
  pageSize: number;
  setPageSize: (pageSize: number) => void;
  filteredEntries: PayrollEntry[];
  paginatedEntries: PayrollEntry[];
  totalCount: number;
}

const SalaryImportDetailsContext = createContext<SalaryImportDetailsState | null>(null);

export const useSalaryImportDetailsContext = () => {
  const context = useContext(SalaryImportDetailsContext);
  if (!context) {
    throw new Error(
      "useSalaryImportDetailsContext must be used within a SalaryImportDetailsProvider or useSalaryImportDetails must be called with arguments"
    );
  }
  return context;
};

export const SalaryImportDetailsProvider = SalaryImportDetailsContext.Provider;

export function useSalaryImportDetails(
  type: SalaryImportType,
  runId: string | null,
  options?: QueryConfig<PayrollRun>
): SalaryImportDetailsState;

export function useSalaryImportDetails(): SalaryImportDetailsState;

export function useSalaryImportDetails(
  type?: SalaryImportType,
  runId?: string | null,
  options?: QueryConfig<PayrollRun>
): SalaryImportDetailsState {
  // If called parameterless, consume context
  if (type === undefined) {
    return useSalaryImportDetailsContext();
  }

  const companyId = useCompanyId();
  const deleteEntryMutation = useDeletePayrollEntry();

  const query = useQuery({
    ...options,
    queryKey: [...queryKeys.payroll.run(companyId ?? "", runId ?? ""), type],
    queryFn: async () => {
      const res = await salaryImportService.getDetails(companyId ?? "", type, runId ?? "");
      return res.data.data;
    },
    enabled: !!companyId && !!runId && (options?.enabled ?? true),
  });

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  const entries = query.data?.entries ?? [];
  const isSalary = type === "SALARY";

  const allComponents = useMemo(() => {
    const earningsMap = new Map<string, string>();
    const deductionsMap = new Map<string, string>();

    entries.forEach((entry) => {
      (entry.components ?? []).forEach((c) => {
        if (c.type === "DEDUCTION") {
          deductionsMap.set(c.code, c.name);
        } else {
          earningsMap.set(c.code, c.name);
        }
      });
    });

    const sortComponents = (list: Array<{ code: string; name: string }>) => {
      const priorityOrder = [
        "BASIC",
        "HRA",
        "CONVEYANCE",
        "MEDICAL",
        "SPECIAL",
        "COMMUNICATION",
        "TELEPHONE",
        "OTHER ALLOWANCE",
        "ALLOWANCE",
      ];

      return [...list].sort((a, b) => {
        const codeA = a.code.toUpperCase();
        const codeB = b.code.toUpperCase();
        const nameA = a.name.toUpperCase();
        const nameB = b.name.toUpperCase();

        const getPriority = (code: string, name: string) => {
          for (let i = 0; i < priorityOrder.length; i++) {
            const p = priorityOrder[i];
            if (code.includes(p) || name.includes(p)) return i;
          }
          return 999;
        };

        const prioA = getPriority(codeA, nameA);
        const prioB = getPriority(codeB, nameB);

        if (prioA !== prioB) return prioA - prioB;
        return a.name.localeCompare(b.name);
      });
    };

    return {
      earnings: sortComponents(Array.from(earningsMap.entries()).map(([code, name]) => ({ code, name }))),
      deductions: sortComponents(Array.from(deductionsMap.entries()).map(([code, name]) => ({ code, name }))),
    };
  }, [entries]);

  const parsedRemarks = useMemo(() => {
    try {
      if (query.data?.remarks) {
        return JSON.parse(query.data.remarks);
      }
    } catch {
      // return default structure
    }
    return null;
  }, [query.data?.remarks]);

  const entryTotals = (entry: PayrollEntry) => {
    const derived = (entry.components ?? []).reduce(
      (acc, c) => {
        const amount = toNumber(c.amount) ?? 0;
        if (c.type === "DEDUCTION") acc.deductions += amount;
        else acc.earnings += amount;
        return acc;
      },
      { earnings: 0, deductions: 0 }
    );
    const gross = toNumber(entry.grossEarnings) ?? derived.earnings;
    const deductions = toNumber(entry.totalDeductions) ?? derived.deductions;
    const net = toNumber(entry.netPay) ?? gross - deductions;
    return { gross, deductions, net };
  };

  const filteredEntries = useMemo(() => {
    if (!search) return entries;
    const lower = search.toLowerCase();
    return entries.filter((e) => {
      const name = (e.employeeName ?? "").toLowerCase();
      const code = (e.employeeCode ?? e.employeeId ?? "").toLowerCase();
      return name.includes(lower) || code.includes(lower);
    });
  }, [entries, search]);

  const paginatedEntries = useMemo(() => {
    const start = page * pageSize;
    return filteredEntries.slice(start, start + pageSize);
  }, [filteredEntries, page, pageSize]);

  const handleSearch = (val: string) => {
    setSearch(val);
    setPage(0);
  };

  return {
    run: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: query.refetch,
    isSalary,
    type,
    allComponents,
    parsedRemarks,
    entryTotals,
    deleteEntryMutation,
    search,
    setSearch: handleSearch,
    page,
    setPage,
    pageSize,
    setPageSize,
    filteredEntries,
    paginatedEntries,
    totalCount: filteredEntries.length,
  };
}
