import { Box } from "@mui/material";
import { useParams, useNavigate } from "react-router-dom";
import { useCurrentRole } from "../../hooks/user";
import { CompanyRole } from "../../constants/enums";
import SalaryImportContent from "../../components/payroll/salary-import/SalaryImportContent";
import type { SalaryImportType } from "../../types";

export default function SalaryImportDetailsPage() {
  const { type, id } = useParams<{ type: string; id: string }>();
  const navigate = useNavigate();
  const isOwner = useCurrentRole() === CompanyRole.OWNER;

  const handleBack = () => {
    navigate("/dashboard/payroll/salary-import");
  };

  const importType = (type?.toUpperCase() as SalaryImportType) ?? "SALARY";

  return (
    <Box
      sx={{
        p: 0,
        height: "calc(100dvh - 104px)",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      {id && (
        <SalaryImportContent
          type={importType}
          runId={id}
          onBack={handleBack}
          canManage={isOwner}
        />
      )}
    </Box>
  );
}
