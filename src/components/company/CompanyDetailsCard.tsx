import type { ReactNode } from "react";
import { Avatar, Box, Chip, Divider, Link, Paper, Typography } from "@mui/material";
import {
  Business,
  CalendarMonth,
  CheckCircle,
  Email,
  LanguageOutlined,
  LocationOn,
  Phone,
  Public,
} from "@mui/icons-material";

import type { Company } from "../../types";
import { getMonthName } from "../../utils/format";
import {
  COMPANY_ROLE_COLORS,
  COMPANY_ROLE_LABELS,
  type CompanyRole,
} from "../../constants/enums";

export interface CompanyDetailsCardProps {
  company: Company | null;
  /** Viewer's role, shown as a context chip in the header (optional). */
  role?: CompanyRole;
}

// Read-only presentation of the company record: a compact branded header
// (avatar, name, status + viewer-role chips) over a dense, table-like field
// grid. Every field degrades to a neutral placeholder when missing, so it is
// safe to render for any role and for companies that have not filled in the
// optional fields. Stretches to the full height of its grid column.
export default function CompanyDetailsCard({
  company,
  role,
}: CompanyDetailsCardProps) {
  const fyMonth =
    company?.financialYearStartMonth != null
      ? getMonthName(company.financialYearStartMonth)
      : null;

  const name = company?.name?.trim() || "Your company";
  const initial = name.charAt(0).toUpperCase();

  return (
    <Paper
      elevation={0}
      sx={{
        borderRadius: 3,
        border: "1px solid",
        borderColor: "divider",
        bgcolor: "background.paper",
        overflow: "hidden",
        height: "100%",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Compact branded header band */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1.5,
          px: 2.5,
          py: 1.75,
          background:
            "linear-gradient(135deg, rgba(37,99,235,0.08) 0%, rgba(124,58,237,0.08) 100%)",
        }}
      >
        <Avatar
          sx={{
            width: 44,
            height: 44,
            fontSize: 18,
            fontWeight: 800,
            color: "common.white",
            background: "linear-gradient(135deg, #2563EB 0%, #7C3AED 100%)",
            boxShadow: "0 4px 12px rgba(37,99,235,0.30)",
          }}
        >
          {initial}
        </Avatar>

        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Typography
            variant="subtitle1"
            sx={{ fontWeight: 800, lineHeight: 1.25 }}
            noWrap
          >
            {name}
          </Typography>
          <Box sx={{ mt: 0.5, display: "flex", flexWrap: "wrap", gap: 0.5 }}>
            <Chip
              size="small"
              icon={<CheckCircle sx={{ fontSize: 14 }} />}
              label="Active"
              color="success"
              variant="outlined"
              sx={{ height: 22, fontWeight: 600, "& .MuiChip-label": { px: 0.75 } }}
            />
            {role && (
              <Chip
                size="small"
                label={`You · ${COMPANY_ROLE_LABELS[role] ?? role}`}
                color={COMPANY_ROLE_COLORS[role] ?? "default"}
                variant="outlined"
                sx={{
                  height: 22,
                  fontWeight: 600,
                  "& .MuiChip-label": { px: 0.75 },
                }}
              />
            )}
          </Box>
        </Box>
      </Box>

      <Divider />

      <Box sx={{ px: 2.5, py: 1.5, flex: 1 }}>
        <Typography
          variant="overline"
          sx={{ color: "text.secondary", fontWeight: 700, letterSpacing: 0.6 }}
        >
          Organization profile
        </Typography>

        <Box
          sx={{
            mt: 0.5,
            display: "grid",
            columnGap: 2.5,
            gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
          }}
        >
          <InfoRow icon={<Business />} label="Company Name" value={company?.name} />
          <InfoRow icon={<Email />} label="Email" value={company?.email} />
          <InfoRow icon={<Phone />} label="Phone" value={company?.phone} />
          <InfoRow
            icon={<LanguageOutlined />}
            label="Website"
            value={
              company?.website ? (
                <Link
                  href={company.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  underline="hover"
                >
                  {company.website}
                </Link>
              ) : null
            }
          />
          <InfoRow
            icon={<CalendarMonth />}
            label="Financial Year Start"
            value={fyMonth}
          />
          <InfoRow
            icon={<Public />}
            label="Country Code"
            value={company?.primaryCountryCode}
          />
          <InfoRow
            icon={<LocationOn />}
            label="Address"
            value={company?.address}
            span
          />
        </Box>
      </Box>
    </Paper>
  );
}

interface InfoRowProps {
  icon: ReactNode;
  label: string;
  // A string (plain value), a node (e.g. a link), or null/empty for "not set".
  value?: ReactNode;
  /** Span both columns (for long values such as the address). */
  span?: boolean;
}

// Compact definition row — small icon + label over value, separated by a thin
// rule so the grid reads like a dense table rather than a stack of cards.
function InfoRow({ icon, label, value, span = false }: InfoRowProps) {
  const isEmpty = value === null || value === undefined || value === "";

  return (
    <Box
      sx={{
        gridColumn: span ? { xs: "auto", sm: "1 / -1" } : "auto",
        display: "flex",
        gap: 1.25,
        alignItems: "flex-start",
        py: 1.1,
        borderBottom: "1px solid",
        borderColor: "divider",
      }}
    >
      <Box
        sx={{
          color: "primary.main",
          mt: 0.25,
          display: "flex",
          "& svg": { fontSize: 18 },
        }}
      >
        {icon}
      </Box>

      <Box sx={{ minWidth: 0 }}>
        <Typography
          variant="caption"
          sx={{
            color: "text.secondary",
            fontWeight: 600,
            textTransform: "uppercase",
            letterSpacing: 0.4,
            display: "block",
            lineHeight: 1.3,
          }}
        >
          {label}
        </Typography>

        <Typography
          component="div"
          variant="body2"
          sx={{
            fontWeight: 600,
            wordBreak: "break-word",
            color: isEmpty ? "text.disabled" : "text.primary",
          }}
        >
          {isEmpty ? "Not set" : value}
        </Typography>
      </Box>
    </Box>
  );
}
