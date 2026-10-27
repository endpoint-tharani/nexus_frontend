import { Box, Card, Typography, LinearProgress, Chip, Stack } from "@mui/material";
import CheckCircleOutlined from "@mui/icons-material/CheckCircleOutlined";
import ErrorOutlineOutlined from "@mui/icons-material/ErrorOutlineOutlined";
import InfoOutlined from "@mui/icons-material/InfoOutlined";
import type { Company } from "../../types";

interface ComplianceStatusCardProps {
  company: Company;
  onFixClick?: (section: string) => void;
}

export default function ComplianceStatusCard({ company, onFixClick }: ComplianceStatusCardProps) {
  // Determine module completeness
  const isProfileComplete = Boolean(company.name && company.email && company.phone && company.address);
  const isTdsComplete = Boolean(company.pan && company.tan);
  const isResponsiblePersonComplete = Boolean(company.responsiblePerson?.name && company.responsiblePerson?.pan);
  const isPayrollComplete = Boolean(company.payrollConfig?.cycle || company.financialYearStartMonth);

  const completedModules = [isProfileComplete, isTdsComplete, isResponsiblePersonComplete, isPayrollComplete].filter(Boolean).length;
  const completionPercentage = Math.round((completedModules / 4) * 100);

  // Missing items
  const warnings: { message: string; section: string }[] = [];
  if (!company.pan) {
    warnings.push({ message: "Company PAN has not been configured", section: "tds" });
  }
  if (!company.tan) {
    warnings.push({ message: "Company TAN is missing", section: "tds" });
  }
  if (!company.responsiblePerson?.pan) {
    warnings.push({ message: "Responsible person PAN is missing", section: "responsible_person" });
  }
  if (!company.address) {
    warnings.push({ message: "Registered office address incomplete", section: "profile" });
  }

  return (
    <Card
      elevation={0}
      sx={{
        p: 2.5,
        borderRadius: "12px",
        border: "1px solid #E2E8F0",
        bgcolor: "#FFFFFF",
      }}
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          alignItems: { xs: "stretch", md: "center" },
          justifyContent: "space-between",
          gap: 3,
        }}
      >
        {/* Left: Overall Completion Progress */}
        <Box sx={{ minWidth: 220 }}>
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 0.75 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: "#1E293B", fontSize: "14px" }}>
              Company Compliance Setup
            </Typography>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: completionPercentage === 100 ? "#166534" : "#2563EB" }}>
              {completionPercentage}%
            </Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={completionPercentage}
            sx={{
              height: 8,
              borderRadius: 4,
              bgcolor: "#E2E8F0",
              "& .MuiLinearProgress-bar": {
                borderRadius: 4,
                bgcolor: completionPercentage === 100 ? "#16A34A" : "#2563EB",
              },
            }}
          />
          <Typography variant="caption" sx={{ color: "#64748B", display: "block", mt: 0.75, fontSize: "11px" }}>
            {completedModules} of 4 core compliance modules configured
          </Typography>
        </Box>

        {/* Center: Module Status Badges */}
        <Box
          sx={{
            display: "flex",
            flexWrap: "wrap",
            gap: 1.25,
            alignItems: "center",
            flex: 1,
            justifyContent: { xs: "flex-start", md: "center" },
            py: { xs: 1, md: 0 },
            borderLeft: { md: "1px solid #E2E8F0" },
            borderRight: { md: "1px solid #E2E8F0" },
            px: { md: 3 },
          }}
        >
          <ModuleChip label="Company Profile" complete={isProfileComplete} onClick={() => onFixClick?.("profile")} />
          <ModuleChip label="TDS Registration" complete={isTdsComplete} onClick={() => onFixClick?.("tds")} />
          <ModuleChip label="Responsible Person" complete={isResponsiblePersonComplete} onClick={() => onFixClick?.("responsible_person")} />
          <ModuleChip label="Payroll Configuration" complete={isPayrollComplete} onClick={() => onFixClick?.("payroll")} />
        </Box>

        {/* Right: Critical Warnings */}
        <Box sx={{ minWidth: { md: 280 } }}>
          {warnings.length === 0 ? (
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, color: "#166534" }}>
              <CheckCircleOutlined sx={{ fontSize: 18 }} />
              <Typography variant="caption" sx={{ fontWeight: 600, fontSize: "12px" }}>
                All statutory requirements configured cleanly.
              </Typography>
            </Box>
          ) : (
            <Stack spacing={0.75}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, color: "#D97706" }}>
                <InfoOutlined sx={{ fontSize: 16 }} />
                <Typography variant="caption" sx={{ fontWeight: 700, fontSize: "11.5px", color: "#B45309", textTransform: "uppercase" }}>
                  Action Required
                </Typography>
              </Box>
              {warnings.slice(0, 2).map((item, i) => (
                <Box
                  key={i}
                  onClick={() => onFixClick?.(item.section)}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    p: 0.75,
                    px: 1.25,
                    borderRadius: "6px",
                    bgcolor: "#FFFBEB",
                    border: "1px solid #FDE68A",
                    cursor: "pointer",
                    transition: "all 0.15s ease",
                    "&:hover": { bgcolor: "#FEF3C7" },
                  }}
                >
                  <ErrorOutlineOutlined sx={{ fontSize: 14, color: "#D97706" }} />
                  <Typography variant="caption" sx={{ color: "#92400E", fontWeight: 600, fontSize: "11.5px" }}>
                    {item.message}
                  </Typography>
                </Box>
              ))}
            </Stack>
          )}
        </Box>
      </Box>
    </Card>
  );
}

function ModuleChip({ label, complete, onClick }: { label: string; complete: boolean; onClick?: () => void }) {
  return (
    <Chip
      size="small"
      icon={complete ? <CheckCircleOutlined sx={{ fontSize: "13px !important", color: "#166534 !important" }} /> : <ErrorOutlineOutlined sx={{ fontSize: "13px !important", color: "#D97706 !important" }} />}
      label={`${label}: ${complete ? "Complete" : "Incomplete"}`}
      onClick={onClick}
      sx={{
        height: "26px",
        fontSize: "11.5px",
        fontWeight: 600,
        bgcolor: complete ? "#F0FDF4" : "#FFFBEB",
        color: complete ? "#166534" : "#B45309",
        border: `1px solid ${complete ? "#BBF7D0" : "#FDE68A"}`,
        cursor: "pointer",
        "& .MuiChip-label": { px: 1 },
      }}
    />
  );
}
