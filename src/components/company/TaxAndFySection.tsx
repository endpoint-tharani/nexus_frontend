import { Button } from "@mui/material";
import { SectionCard } from "../ui";
import DetailGrid from "./DetailGrid";
import DetailItem from "./DetailItem";
import { getMonthName } from "../../utils/format";
import type { Company } from "../../types";

interface TaxAndFySectionProps {
  company: Company;
  onConfigure: () => void;
}

export default function TaxAndFySection({ company, onConfigure }: TaxAndFySectionProps) {
  const startMonthNum = company.financialYearStartMonth ?? 4;
  const startMonthName = getMonthName(startMonthNum);

  return (
    <SectionCard
      title="Tax Configuration"
      subtitle="Financial period cycles, default tax regimes, and employee declaration controls."
      actions={
        <Button
          size="small"
          onClick={onConfigure}
          sx={{
            p: 0,
            fontSize: "13px",
            fontWeight: 600,
            color: "primary.main",
            textTransform: "none",
            "&:hover": { bgcolor: "transparent", textDecoration: "underline" },
          }}
        >
          Configure
        </Button>
      }
    >
      <DetailGrid columns={2}>
        <DetailItem label="Financial Year" value="FY 2026-27" />
        <DetailItem label="Assessment Year" value="AY 2027-28" />
        <DetailItem label="FY Starts" value={startMonthName} />
        <DetailItem label="Default Tax Regime" value="New Tax Regime (Sec 115BAC)" />
        <DetailItem label="TDS Calculation" value="Enabled" />
        <DetailItem
          label="Declaration Window"
          value={company.employeeViewEnabled !== false ? "Open" : "Closed"}
        />
      </DetailGrid>
    </SectionCard>
  );
}
