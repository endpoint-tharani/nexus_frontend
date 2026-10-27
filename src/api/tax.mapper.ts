import type {
  TaxDeclaration,
  TaxProofItem,
  TaxTrackingRow,
  TaxWorkingSheet,
} from "../types";

// Flattens the backend's nested income-tax "working sheet" into the flat
// `TaxDeclaration` the UI is built around. Every read of a single-declaration
// endpoint (admin GET /tax/declaration and self-service GET
// /me/tax/declaration) funnels through here, so the working-sheet→UI contract
// lives in exactly one place. Money columns already arrive as numbers; null
// optionals are normalized to `undefined`.
export function mapWorkingSheetToDeclaration(
  ws: TaxWorkingSheet
): TaxDeclaration {
  const items: TaxProofItem[] = (ws.items ?? []).map((it) => ({
    id: it.id,
    section: it.section,
    amount: it.amount,
    description: it.description ?? undefined,
    referenceNo: it.referenceNo ?? undefined,
    proofDocKey: it.proofDocKey ?? undefined,
  }));

  return {
    id: ws.declarationId,
    employeeId: ws.employee.id,
    employeeName: ws.employee.name,
    employeeCode: ws.employee.employeeCode,
    year: ws.financialYear.start,
    regime: ws.regime,
    status: ws.status,
    items,
    // chapterVIATotal is the computed Chapter VI-A deductions total — the
    // closest single figure to "total declared deductions".
    totalDeclared: ws.totals?.totalDeclaredDeductions ?? ws.deductions?.chapterVIATotal,
    estimatedTax: ws.computation?.totalTaxPayable,
    taxableIncome: ws.computation?.taxableIncome,
    grandTotalSalary:
      ws.computation?.grandTotalSalary ?? ws.salary?.grandTotalSalary,
    tdsDeducted: ws.computation?.tdsDeducted,
    balanceTaxPayable: ws.computation?.balanceTaxPayable,
    proofCount: items.filter((it) => it.proofDocKey).length,
    itemCount: items.length,
    rejectionReason: ws.review?.rejectionReason ?? undefined,
    submittedAt: ws.review?.submittedAt ?? undefined,
    reviewedAt: ws.review?.approvedAt ?? undefined,
    entries: ws.entries,
    raw: ws,
  };
}

// Flattens an admin tracking row (GET /tax/declarations) into the flat
// `TaxDeclaration` the table + dialogs consume. The critical remap is
// `declarationId → id` and `financialYearStart → year`: without it every row's
// `id`/`year` is undefined, which silently breaks view/approve/reject/export.
// Tracking rows carry no proof items, only counts, so `items` is left empty —
// the detail dialog fetches the full working sheet (with items) on demand.
export function mapTrackingRowToDeclaration(
  row: TaxTrackingRow
): TaxDeclaration {
  return {
    id: row.declarationId,
    employeeId: row.employeeId,
    employeeName: row.employeeName,
    employeeCode: row.employeeCode,
    year: row.financialYearStart,
    regime: row.regime,
    status: row.status,
    items: [],
    taxableIncome: row.taxableIncome,
    estimatedTax: row.totalTaxPayable,
    grandTotalSalary: row.grandTotalSalary,
    tdsDeducted: row.tdsDeducted,
    balanceTaxPayable: row.balanceTaxPayable,
    proofCount: row.proofCount,
    itemCount: row.itemCount,
    submittedAt: row.submittedAt ?? undefined,
    reviewedAt: row.approvedAt ?? undefined,
    rejectionReason: row.rejectionReason ?? undefined,
  };
}
