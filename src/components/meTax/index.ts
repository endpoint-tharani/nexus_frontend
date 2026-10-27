// Barrel for the Employee Self-Service Tax feature components. ONE unified
// declaration screen — the legacy "Declaration & Proofs" tab was retired when
// the two tax systems were merged into a single engine.

export { default as IncomeWorksheet } from "./IncomeWorksheet";
export type { IncomeWorksheetProps } from "./IncomeWorksheet";

export { default as MyTaxSummaryCards } from "./MyTaxSummaryCards";
export type { MyTaxSummaryCardsProps } from "./MyTaxSummaryCards";

export { default as PreviousEmploymentSection } from "./PreviousEmploymentSection";
export type { PreviousEmploymentSectionProps } from "./PreviousEmploymentSection";

// ── New modern UI components ──────────────────────────────────────────────

export { default as SectionHeader } from "./SectionHeader";
export type { SectionHeaderProps } from "./SectionHeader";

export { default as SalaryCard } from "./SalaryCard";
export type { SalaryCardProps } from "./SalaryCard";

export { default as TaxSummaryCard } from "./TaxSummaryCard";
export type { TaxSummaryCardProps } from "./TaxSummaryCard";

export { default as FloatingTaxSummary } from "./FloatingTaxSummary";
export type { FloatingTaxSummaryProps } from "./FloatingTaxSummary";

export { default as IncomeAccordion } from "./IncomeAccordion";
export type { IncomeAccordionProps } from "./IncomeAccordion";

export { default as DeductionAccordion } from "./DeductionAccordion";
export type { DeductionAccordionProps } from "./DeductionAccordion";

export { default as PreviousEmploymentAccordion } from "./PreviousEmploymentAccordion";
export type { PreviousEmploymentAccordionProps } from "./PreviousEmploymentAccordion";

export { default as TdsHistorySection } from "./TdsHistorySection";
export type { TdsHistorySectionProps } from "./TdsHistorySection";
