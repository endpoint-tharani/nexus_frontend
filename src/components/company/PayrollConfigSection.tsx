import { Box, Button, Link } from "@mui/material";
import ArrowForwardOutlined from "@mui/icons-material/ArrowForwardOutlined";
import { SectionCard } from "../ui";
import DetailGrid from "./DetailGrid";
import DetailItem from "./DetailItem";
import type { Company } from "../../types";

interface PayrollConfigSectionProps {
  company: Company;
  onManage: () => void;
}

export default function PayrollConfigSection({ company, onManage }: PayrollConfigSectionProps) {
  const pConfig = company.payrollConfig || {};

  return (
    <SectionCard
      title="Payroll Configuration"
      subtitle="Summary of active payroll processing modes and attendance integration."
      actions={
        <Button
          size="small"
          onClick={onManage}
          sx={{
            p: 0,
            fontSize: "13px",
            fontWeight: 600,
            color: "primary.main",
            textTransform: "none",
            "&:hover": { bgcolor: "transparent", textDecoration: "underline" },
          }}
        >
          Manage
        </Button>
      }
    >
      <DetailGrid columns={2}>
        <DetailItem label="Payroll Cycle" value={pConfig.cycle || "Monthly"} />
        <DetailItem label="Payroll Mode" value={pConfig.mode || "Attendance & LOP Driven"} />
        <DetailItem label="Salary Import" value={pConfig.salaryImport !== false ? "Enabled" : "Disabled"} />
        <DetailItem label="Attendance Integration" value={pConfig.attendanceIntegration !== false ? "Active" : "Disabled"} />
      </DetailGrid>

      <Box sx={{ mt: 2, pt: 1.5, borderTop: "1px solid", borderTopColor: "divider" }}>
        <Link
          component="button"
          type="button"
          onClick={onManage}
          sx={{
            fontSize: "13px",
            fontWeight: 600,
            color: "primary.main",
            textDecoration: "none",
            display: "inline-flex",
            alignItems: "center",
            gap: 0.5,
            "&:hover": { textDecoration: "underline" },
          }}
        >
          <span>View all payroll settings</span>
          <ArrowForwardOutlined sx={{ fontSize: 15 }} />
        </Link>
      </Box>
    </SectionCard>
  );
}
