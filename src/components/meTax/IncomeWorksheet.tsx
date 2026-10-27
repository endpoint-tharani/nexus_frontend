import { Alert, Box, CircularProgress, Stack, Typography } from "@mui/material";

import { useMyTaxForm, useStructuredDeclaration } from "../../hooks/taxStructured";
import { DeclarationStatus, TaxRegime, TAX_REGIME_LABELS } from "../../constants/enums";
import type { EmployeeStructuredDeclaration, StructuredFormSection, TaxFormSchema } from "../../types";

import SalaryCard from "./SalaryCard";
import IncomeAccordion from "./IncomeAccordion";
import DeductionAccordion from "./DeductionAccordion";
import TaxSummaryCard from "./TaxSummaryCard";

export interface IncomeWorksheetProps {
  year: number;
  decl?: EmployeeStructuredDeclaration;
  formSchema?: TaxFormSchema;
  readOnly?: boolean;
  declarationId?: string;
}

const isIncome = (s: StructuredFormSection) => s.category === "INCOME";
const isDeduction = (s: StructuredFormSection) => !isIncome(s);

export default function IncomeWorksheet({
  year,
  decl,
  formSchema,
  readOnly = false,
  declarationId,
}: IncomeWorksheetProps) {
  const declQuery = useStructuredDeclaration(year, undefined, { enabled: !decl });
  const activeDecl = decl ?? declQuery.data;

  const formQuery = useMyTaxForm(year, activeDecl?.regime, {
    enabled: !formSchema && !!activeDecl,
  });
  const activeForm = formSchema ?? formQuery.data;

  const isLoading = !decl && declQuery.isLoading;
  const isError = !decl && declQuery.isError;
  const isFormLoading = !formSchema && formQuery.isLoading;

  // ── Loading ──────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <Box sx={{ py: 8, textAlign: "center" }}>
        <CircularProgress />
      </Box>
    );
  }

  if (isError || !activeDecl) {
    return (
      <Typography color="error" sx={{ py: 4, textAlign: "center" }}>
        Couldn't load your income worksheet. Please refresh and try again.
      </Typography>
    );
  }

  const editable =
    !readOnly &&
    !activeDecl.locked &&
    (!!declarationId ||
      activeDecl.status === DeclarationStatus.DRAFT ||
      activeDecl.status === DeclarationStatus.REJECTED);

  const sections = activeForm?.sections ?? [];
  const incomeSections = sections.filter(isIncome);
  const deductionSections = sections.filter(isDeduction);

  return (
    <Stack spacing={2}>
      {/* Regime info */}
      <Alert severity="info" sx={{ borderRadius: "8px" }}>
        Declaring under the{" "}
        <strong>{TAX_REGIME_LABELS[activeDecl.regime] ?? activeDecl.regime}</strong>.
        {activeDecl.regime === TaxRegime.NEW &&
          " Under the new regime only the standard deduction and a few items (e.g. employer NPS) apply."}
      </Alert>

      {/* 1. Salary — compact table in Accordion */}
      <SalaryCard salary={activeDecl.salary} defaultExpanded />

      {/* 2. Income heads — House Property, Other Sources */}
      {isFormLoading ? (
        <Box sx={{ py: 3, textAlign: "center" }}>
          <CircularProgress size={24} />
        </Box>
      ) : (
        <>
          {incomeSections.length > 0 && (
            <IncomeAccordion
              sections={incomeSections}
              entries={activeDecl.entries}
              year={year}
              disabled={!editable}
              declarationId={declarationId}
            />
          )}

          {/* 3. Deductions (grouped) */}
          {deductionSections.length > 0 && (
            <>
              <Box sx={{ pt: 0.5 }}>
                <Typography
                  variant="caption"
                  sx={{
                    fontWeight: 600,
                    letterSpacing: "0.07em",
                    color: "text.secondary",
                    textTransform: "uppercase",
                  }}
                >
                  Exemptions &amp; Deductions
                </Typography>
              </Box>

              <DeductionAccordion
                sections={deductionSections}
                entries={activeDecl.entries}
                year={year}
                disabled={!editable}
                declarationId={declarationId}
              />
            </>
          )}
        </>
      )}

      {/* 4. Unified Tax Summary */}
      <TaxSummaryCard summary={activeDecl.summary} />
    </Stack>
  );
}
