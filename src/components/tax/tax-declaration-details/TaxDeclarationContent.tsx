import { Box, CircularProgress, Typography, ToggleButton, ToggleButtonGroup } from "@mui/material";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

import { useTaxDeclaration } from "../../../hooks/tax";
import { DeclarationStatus, TaxRegime } from "../../../constants/enums";
import type { EmployeeStructuredDeclaration, TaxDeclaration } from "../../../types";
import { updateDeclarationRegimeAdmin } from "../../../api/tax.api";
import { queryKeys } from "../../../constants/queryKeys";
import { useCompanyId } from "../../../hooks/shared/useCompanyId";
import { getErrorMessage } from "../../../utils";


import TaxDeclarationHeader from "./TaxDeclarationHeader";
import TaxDeclarationSummary from "./TaxDeclarationSummary";

import MyTaxSummaryCards from "../../meTax/MyTaxSummaryCards";
import IncomeWorksheet from "../../meTax/IncomeWorksheet";
import TdsHistorySection from "../../meTax/TdsHistorySection";
import FloatingTaxSummary from "../../meTax/FloatingTaxSummary";

const mapToStructuredDeclaration = (
  decl: TaxDeclaration
): EmployeeStructuredDeclaration => {
  const raw = decl.raw;
  return {
    declarationId: decl.id,
    status: decl.status,
    regime: decl.regime,
    financialYear: {
      start: decl.year,
      end: decl.year + 1,
      label: `FY ${decl.year}-${String(decl.year + 1).slice(-2)}`,
      startMonth: decl.raw?.financialYear?.startMonth ?? 4,
      paidMonths: decl.raw?.financialYear?.paidMonths ?? 0,
      remainingMonths: decl.raw?.financialYear?.remainingMonths ?? 12,
    },
    locked: decl.status !== DeclarationStatus.DRAFT && decl.status !== DeclarationStatus.REJECTED,
    lockedAt: decl.submittedAt ?? null,
    employee: {
      id: decl.employeeId,
      employeeCode: decl.employeeCode ?? "",
      name: decl.employeeName ?? "",
      email: raw?.employee?.email ?? null,
      pan: raw?.employee?.pan ?? null,
    },
    salary: {
      grandTotalSalary: Number(raw?.salary?.grandTotalSalary ?? 0),
      basicAnnual: Number(raw?.salary?.basicAnnual ?? 0),
      hraAnnual: Number(raw?.salary?.hraAnnual ?? 0),
      conveyanceAnnual: Number(raw?.salary?.conveyanceAnnual ?? 0),
      medicalAnnual: Number(raw?.salary?.medicalAnnual ?? 0),
      specialAllowanceAnnual: Number(raw?.salary?.specialAllowanceAnnual ?? 0),
      communicationAnnual: Number(raw?.salary?.communicationAnnual ?? 0),
      otherAllowanceAnnual: Number(raw?.salary?.otherAllowanceAnnual ?? 0),
      bonusAnnual: Number(raw?.salary?.bonusAnnual ?? 0),
      incentiveAnnual: Number(raw?.salary?.incentiveAnnual ?? 0),
      gratuityAmount: Number(raw?.salary?.gratuityAmount ?? 0),
      gratuityRemarks: raw?.salary?.gratuityRemarks ?? null,
      elEncashmentAmount: Number(raw?.salary?.elEncashmentAmount ?? 0),
      elEncashmentRemarks: raw?.salary?.elEncashmentRemarks ?? null,
      previousEmploymentSalary: Number(raw?.salary?.previousEmploymentSalary ?? 0),
      professionalTaxAnnual: Number(raw?.deductions?.professionalTaxAnnual ?? 0),
      tdsDeducted: Number(raw?.computation?.tdsDeducted ?? 0),
    },
    entries: decl.entries ?? [],
    summary: {
      regime: decl.regime,
      income: {
        grossSalary: Number(raw?.income?.grossSalary ?? 0),
        hraExemption: Number(raw?.income?.hraExemption ?? 0),
        incomeFromSalary: Number(raw?.income?.incomeFromSalary ?? 0),
        previousEmployment: Number(raw?.income?.previousEmployment ?? 0),
        houseProperty: Number(raw?.income?.houseProperty ?? 0),
        otherSources: Number(raw?.income?.otherSources ?? 0),
        grossTotalIncome: Number(raw?.income?.grossTotalIncome ?? 0),
      },
      deductions: {
        standardDeduction: Number(raw?.deductions?.standardDeduction ?? 0),
        professionalTax: Number(raw?.deductions?.professionalTaxAnnual ?? 0),
        homeLoanInterest: Number(raw?.deductions?.housingLoanInterest ?? 0),
        chapterVIA: (raw?.deductions?.chapterVIA ?? []).map((c: any) => ({
          code: c.code,
          label: c.label,
          declared: Number(c.declared),
          allowed: Number(c.allowed),
        })),
        chapterVIATotal: Number(raw?.deductions?.chapterVIATotal ?? 0),
        hraExemption: Number(raw?.hra?.exemption ?? 0),
      },
      computation: {
        grandTotalSalary: Number(raw?.computation?.grandTotalSalary ?? 0),
        grossTotalIncome: Number(raw?.computation?.grossTotalIncome ?? 0),
        taxableIncome: Number(raw?.computation?.taxableIncome ?? 0),
        taxBeforeRebate: Number(raw?.computation?.taxBeforeRebate ?? 0),
        rebate87A: Number(raw?.computation?.rebate87A ?? 0),
        surcharge: Number(raw?.computation?.surcharge ?? 0),
        cess: Number(raw?.computation?.cess ?? 0),
        totalTaxPayable: Number(raw?.computation?.totalTaxPayable ?? 0),
        tdsDeducted: Number(raw?.computation?.tdsDeducted ?? 0),
        balanceTaxPayable: Number(raw?.computation?.balanceTaxPayable ?? 0),
        recommendedMonthlyTds: Number(raw?.computation?.recommendedMonthlyTds ?? 0),
      },
      totals: {
        totalDeclaredIncome: Number(raw?.totals?.totalDeclaredIncome ?? 0),
        totalDeclaredDeductions: Number(raw?.totals?.totalDeclaredDeductions ?? 0),
      },
    },
    review: {
      submittedAt: decl.submittedAt ?? null,
      approvedAt: decl.reviewedAt ?? null,
      rejectionReason: decl.rejectionReason ?? null,
    },
  };
};

export interface TaxDeclarationContentProps {
  declarationId: string;
  onBack: () => void;
  exporting?: boolean;
  onExport: (declaration: TaxDeclaration) => void;
}

export default function TaxDeclarationContent({
  declarationId,
  onBack,
  exporting = false,
  onExport,
}: TaxDeclarationContentProps) {
  const {
    data: declaration,
    isLoading,
    isError,
  } = useTaxDeclaration(declarationId);

  const companyId = useCompanyId();
  const queryClient = useQueryClient();

  const updateRegimeMutation = useMutation({
    mutationFn: async (nextRegime: TaxRegime) => {
      if (!companyId || !declarationId || !declaration) throw new Error("Missing parameters");
      const res = await updateDeclarationRegimeAdmin(companyId, declarationId, declaration.year, nextRegime);
      return res.data.data;
    },
    onSuccess: () => {
      toast.success("Tax regime updated successfully");
      queryClient.invalidateQueries({
        queryKey: queryKeys.tax.declaration(companyId ?? "", declarationId),
      });
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });

  const handleRegimeChange = (
    _event: React.MouseEvent<HTMLElement>,
    next: TaxRegime | null
  ) => {
    if (!next || !declaration || next === declaration.regime) return;
    updateRegimeMutation.mutate(next);
  };

  if (isLoading) {
    return (
      <Box sx={{ py: 6, textAlign: "center" }}>
        <CircularProgress />
      </Box>
    );
  }

  if (isError || !declaration) {
    return (
      <Box sx={{ py: 6, textAlign: "center", display: "flex", flexDirection: "column", gap: 2, alignItems: "center" }}>
        <Typography color="error" sx={{ fontWeight: 600 }}>
          Failed to load the declaration.
        </Typography>
        <TaxDeclarationHeader onBack={onBack} exporting={false} onExport={() => {}} />
      </Box>
    );
  }

  const decl = mapToStructuredDeclaration(declaration);

  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100%", flex: 1, minHeight: 0 }}>
      {/* Header */}
      <Box sx={{ flexShrink: 0 }}>
        <TaxDeclarationHeader
          onBack={onBack}
          exporting={exporting}
          onExport={() => onExport(declaration)}
        />
      </Box>

      <Box
        sx={{
          flex: 1,
          overflowY: "auto",
          minHeight: 0,
          pb: 4,
          display: "flex",
          flexDirection: "column",
          gap: 3,
          "&::-webkit-scrollbar": {
            display: "none",
          },
          msOverflowStyle: "none",
          scrollbarWidth: "none",
        }}
      >
        
        {/* Regime Toggle Row */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1.5,
            px: 2.5,
            py: 1.5,
            border: "none",
            borderRadius: "10px",
            bgcolor: "background.paper",
          }}
        >
          <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
            Tax Regime:
          </Typography>
          <ToggleButtonGroup
            exclusive
            size="small"
            color="primary"
            value={decl.regime ?? null}
            onChange={handleRegimeChange}
            disabled={decl.locked || updateRegimeMutation.isPending}
            aria-label="Tax regime selector"
            sx={{
              "& .MuiToggleButton-root": {
                borderRadius: "8px",
                px: 2,
                py: 0.5,
                fontWeight: 600,
                textTransform: "none",
                border: "1px solid",
                borderColor: "divider",
                color: "text.secondary",
                "&.Mui-selected": {
                  color: "primary.main",
                  bgcolor: "rgba(37,99,235,0.06)",
                  borderColor: "primary.main",
                  fontWeight: 700,
                },
              },
            }}
          >
            <ToggleButton value={TaxRegime.OLD} aria-label="Old regime">
              Old
            </ToggleButton>
            <ToggleButton value={TaxRegime.NEW} aria-label="New regime">
              New
            </ToggleButton>
          </ToggleButtonGroup>
          {updateRegimeMutation.isPending && <CircularProgress size={16} />}
        </Box>

        {/* Summary Info */}
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <TaxDeclarationSummary declaration={declaration} />
          <MyTaxSummaryCards declaration={decl} />
        </Box>

        {/* Two-column layout: main content + sticky sidebar */}
        <Box
          sx={{
            display: "flex",
            gap: 3,
            alignItems: "flex-start",
          }}
        >
          {/* Main content (left / full width on mobile) */}
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
              {/* Accordion-based worksheet */}
              <IncomeWorksheet year={declaration.year} decl={decl} readOnly={false} declarationId={declarationId} />

              {/* TDS deduction history */}
              <TdsHistorySection employeeId={declaration.employeeId} year={declaration.year} />
            </Box>
          </Box>

          {/* Sticky floating summary */}
          <FloatingTaxSummary declaration={decl} />
        </Box>
      </Box>
    </Box>
  );
}
