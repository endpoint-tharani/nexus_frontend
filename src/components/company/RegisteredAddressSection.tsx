import { Box, Button, Typography } from "@mui/material";
import { SectionCard } from "../ui";
import type { Company } from "../../types";

interface RegisteredAddressSectionProps {
  company: Company;
  onEdit: () => void;
}

export default function RegisteredAddressSection({ company, onEdit }: RegisteredAddressSectionProps) {
  const rawAddress = company.address || "";
  
  // Clean raw address string
  const cleanAddress = rawAddress
    .replace(/\bNA\b/gi, "")
    .replace(/\s+,\s+/g, ", ")
    .replace(/,+/g, ",")
    .trim();

  const addressLines = cleanAddress ? cleanAddress.split(",").map((s) => s.trim()).filter(Boolean) : [];

  return (
    <SectionCard
      title="Registered Office Address"
      subtitle="Official physical office location registered for statutory notices."
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
      {addressLines.length > 0 ? (
        <Box sx={{ py: 0.5 }}>
          {addressLines.map((line, idx) => (
            <Typography
              key={idx}
              variant="body2"
              sx={{
                fontWeight: idx === 0 ? 600 : 400,
                color: "text.primary",
                fontSize: "14px",
                lineHeight: 1.5,
              }}
            >
              {line}
            </Typography>
          ))}

          <Typography variant="caption" sx={{ color: "text.secondary", display: "block", mt: 1, fontSize: "12px", fontWeight: 500 }}>
            Country: {company.primaryCountryCode || "India (IN)"}
          </Typography>
        </Box>
      ) : (
        <Box sx={{ py: 1 }}>
          <Typography variant="body2" sx={{ color: "text.disabled", fontSize: "14px", mb: 0.5 }}>
            Not configured
          </Typography>
          <Button
            size="small"
            onClick={onEdit}
            sx={{
              p: 0,
              fontSize: "12.5px",
              fontWeight: 600,
              color: "primary.main",
              textTransform: "none",
              "&:hover": { bgcolor: "transparent", textDecoration: "underline" },
            }}
          >
            + Add Registered Office Address
          </Button>
        </Box>
      )}
    </SectionCard>
  );
}
