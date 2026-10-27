import { Button, Link } from "@mui/material";
import { SectionCard } from "../ui";
import DetailGrid from "./DetailGrid";
import DetailItem from "./DetailItem";
import type { Company } from "../../types";

interface CompanyInfoSectionProps {
  company: Company;
  onEdit: () => void;
}

export default function CompanyInfoSection({ company, onEdit }: CompanyInfoSectionProps) {
  return (
    <SectionCard
      title="Company Profile"
      subtitle="Legal identity identifiers and official contact details."
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
        <DetailItem label="Legal Entity Name" value={company.name} />
        <DetailItem label="Company Code" value={company.code || "COMP-001"} />
        <DetailItem label="Entity Type" value={company.entityType || "Private Limited"} />
        <DetailItem label="Date of Incorporation" value={company.dateOfIncorporation || "01 Apr 2020"} />
        <DetailItem
          label="Website"
          value={
            company.website ? (
              <Link href={company.website.startsWith("http") ? company.website : `https://${company.website}`} target="_blank" rel="noopener" sx={{ color: "primary.main", textDecoration: "none", "&:hover": { textDecoration: "underline" } }}>
                {company.website}
              </Link>
            ) : null
          }
          onAddClick={onEdit}
          addLabel="+ Add Website"
        />
        <DetailItem label="Operations Email" value={company.email} onAddClick={onEdit} addLabel="+ Add Email" />
        <DetailItem label="Business Phone" value={company.phone} onAddClick={onEdit} addLabel="+ Add Phone" />
      </DetailGrid>
    </SectionCard>
  );
}
