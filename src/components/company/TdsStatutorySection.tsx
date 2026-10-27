import { Button } from "@mui/material";
import { SectionCard } from "../ui";
import DetailGrid from "./DetailGrid";
import DetailItem from "./DetailItem";
import type { Company } from "../../types";

interface TdsStatutorySectionProps {
  company: Company;
  onEdit: () => void;
}

export default function TdsStatutorySection({ company, onEdit }: TdsStatutorySectionProps) {
  const isPanConfigured = Boolean(company.pan && company.pan.length > 3);
  const isTanConfigured = Boolean(company.tan && company.tan.length > 3);

  return (
    <SectionCard
      title="TDS &amp; Statutory Details"
      subtitle="Tax Deduction Account Number (TAN), Permanent Account Number (PAN), and statutory registration codes."
      actions={
        <Button
          size="small"
          onClick={onEdit}
          sx={{
            p: 0,
            fontSize: "13px",
            fontWeight: 600,
            color: "primary.main",
            textTransform: "none",
            "&:hover": { bgcolor: "transparent", textDecoration: "underline" },
          }}
        >
          Edit
        </Button>
      }
    >
      <DetailGrid columns={2}>
        <DetailItem
          label="TAN (Tax Deduction Account)"
          value={company.tan}
          status={isTanConfigured ? "configured" : "missing"}
          onAddClick={onEdit}
          addLabel="+ Add TAN"
        />
        <DetailItem
          label="PAN (Permanent Account)"
          value={company.pan}
          status={isPanConfigured ? "configured" : "missing"}
          onAddClick={onEdit}
          addLabel="+ Add PAN"
        />

        <DetailItem label="Deductor Type" value={company.deductorType || "Company"} />
        <DetailItem label="Deductor Category" value={company.deductorCategory || "Private Enterprise"} />
        <DetailItem label="TDS Circle / AO Code" value={company.tdsCircle || "Ward T2D / Chennai / W-51"} />
        <DetailItem
          label="GSTIN"
          value={company.gstin}
          onAddClick={onEdit}
          addLabel="+ Add GSTIN"
        />

        <DetailItem
          label="PF Registration Number"
          value={company.pfRegistrationNo || "TN/MAS/0098471/000"}
        />
        <DetailItem
          label="ESI Registration Number"
          value={company.esiRegistrationNo || "33000847120001001"}
        />
        <DetailItem
          label="Professional Tax Registration"
          value={company.ptRegistrationNo || "PT/CHE/2024/774"}
        />
      </DetailGrid>
    </SectionCard>
  );
}
