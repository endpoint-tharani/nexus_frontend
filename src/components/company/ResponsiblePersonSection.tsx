import { Box, Button, Chip } from "@mui/material";
import { SectionCard } from "../ui";
import DetailGrid from "./DetailGrid";
import DetailItem from "./DetailItem";
import type { Company } from "../../types";

interface ResponsiblePersonSectionProps {
  company: Company;
  onEdit: () => void;
}

export default function ResponsiblePersonSection({ company, onEdit }: ResponsiblePersonSectionProps) {
  const rp = company.responsiblePerson || {
    name: "Rajesh Kumar",
    designation: "Finance Director & Authorized Signatory",
    pan: "ABCDE1234F",
    email: "rajesh.kumar@auronox.com",
    phone: "+91 98765 43210",
  };

  return (
    <SectionCard
      title="Responsible Person"
      subtitle="Designated officer for Form 24Q quarterly returns & Form 16 under IT Act Sec 204."
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
        <DetailItem label="Full Legal Name" value={rp.name} onAddClick={onEdit} addLabel="+ Add Responsible Person" />
        <DetailItem
          label="Corporate Designation"
          value={
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
              <span>{rp.designation}</span>
              <Chip
                size="small"
                label="Authorized Signatory"
                sx={{
                  height: "18px",
                  fontSize: "10.5px",
                  fontWeight: 600,
                  bgcolor: (theme) => (theme.palette.mode === "dark" ? "rgba(22, 101, 52, 0.25)" : "#F0FDF4"),
                  color: (theme) => (theme.palette.mode === "dark" ? "#4ADE80" : "#166534"),
                  border: "1px solid",
                  borderColor: (theme) => (theme.palette.mode === "dark" ? "rgba(74, 222, 128, 0.3)" : "#BBF7D0"),
                  "& .MuiChip-label": { px: 0.75 },
                }}
              />
            </Box>
          }
        />
        <DetailItem label="Officer PAN" value={rp.pan} onAddClick={onEdit} addLabel="+ Add PAN" />
        <DetailItem label="Official Email" value={rp.email} />
        <DetailItem label="Direct Phone" value={rp.phone} />
      </DetailGrid>
    </SectionCard>
  );
}
