import { Grid, Box, Link } from "@mui/material";
import BusinessOutlined from "@mui/icons-material/BusinessOutlined";
import EmailOutlined from "@mui/icons-material/EmailOutlined";
import PhoneOutlined from "@mui/icons-material/PhoneOutlined";
import LanguageOutlined from "@mui/icons-material/LanguageOutlined";
import LocationOnOutlined from "@mui/icons-material/LocationOnOutlined";
import CalendarMonthOutlined from "@mui/icons-material/CalendarMonthOutlined";
import PublicOutlined from "@mui/icons-material/PublicOutlined";

import { SectionCard, InfoRow } from "../ui";
import { getMonthName } from "../../utils/format";
import type { Company } from "../../types";

interface CompanyInfoCardProps {
  company: Company;
}

export default function CompanyInfoCard({ company }: CompanyInfoCardProps) {
  const fyMonth =
    company.financialYearStartMonth != null
      ? getMonthName(company.financialYearStartMonth)
      : null;

  return (
    <Grid container spacing={3}>
      {/* General Details */}
      <Grid size={{ xs: 12, md: 6 }}>
        <SectionCard title="General Profile" subtitle="Core company identifiers.">
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
            <InfoRow icon={<BusinessOutlined />} label="Legal Entity Name" value={company.name} />
            <InfoRow
              icon={<LanguageOutlined />}
              label="Website Address"
              value={
                company.website ? (
                  <Link href={company.website} target="_blank" rel="noopener noreferrer" sx={{ color: "#2563EB" }}>
                    {company.website}
                  </Link>
                ) : null
              }
            />
          </Box>
        </SectionCard>
      </Grid>

      {/* Contact Details */}
      <Grid size={{ xs: 12, md: 6 }}>
        <SectionCard title="Corporate Contact" subtitle="Official channels for communications.">
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
            <InfoRow icon={<EmailOutlined />} label="Operations Email" value={company.email} />
            <InfoRow icon={<PhoneOutlined />} label="Business Phone" value={company.phone} />
          </Box>
        </SectionCard>
      </Grid>

      {/* Compliance & Financial details */}
      <Grid size={{ xs: 12, md: 6 }}>
        <SectionCard title="Compliance &amp; Financials" subtitle="Official registration metrics.">
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
            <InfoRow icon={<PublicOutlined />} label="Primary Country Code" value={company.primaryCountryCode} />
            <InfoRow icon={<CalendarMonthOutlined />} label="Financial Year Start" value={fyMonth} />
            <InfoRow icon={<BusinessOutlined />} label="Company PAN" value={company.pan} />
            <InfoRow icon={<BusinessOutlined />} label="Company TAN" value={company.tan} />
          </Box>
        </SectionCard>
      </Grid>

      {/* Address Details */}
      <Grid size={{ xs: 12, md: 6 }}>
        <SectionCard title="Corporate Address" subtitle="Registered physical office location.">
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
            <InfoRow icon={<LocationOnOutlined />} label="HQ Physical Address" value={company.address} span />
          </Box>
        </SectionCard>
      </Grid>
    </Grid>
  );
}
