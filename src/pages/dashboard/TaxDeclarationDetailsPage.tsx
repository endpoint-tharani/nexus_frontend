import { Box } from "@mui/material";
import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import toast from "react-hot-toast";
import TaxDeclarationContent from "../../components/tax/tax-declaration-details/TaxDeclarationContent";
import { useCompanyId } from "../../hooks/shared/useCompanyId";
import { exportDeclaration } from "../../api/tax.api";
import { downloadXlsx, getErrorMessage } from "../../utils";
import type { TaxDeclaration } from "../../types";

export default function TaxDeclarationDetailsPage() {
  const { declarationId } = useParams<{ declarationId: string }>();
  const navigate = useNavigate();
  const companyId = useCompanyId();
  const [exportingId, setExportingId] = useState<string | null>(null);

  const handleBack = () => {
    navigate("/dashboard/tax");
  };

  const handleExportDeclaration = async (declaration: TaxDeclaration) => {
    if (!companyId) {
      toast.error("No active company selected.");
      return;
    }
    setExportingId(declaration.id);
    try {
      const res = await exportDeclaration(companyId, declaration.id);
      const who = declaration.employeeCode ?? declaration.employeeId;
      downloadXlsx(res.data, `tax-declaration-${who}-FY${declaration.year}`);
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setExportingId(null);
    }
  };

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
      {declarationId && (
        <TaxDeclarationContent
          declarationId={declarationId}
          onBack={handleBack}
          exporting={exportingId === declarationId}
          onExport={handleExportDeclaration}
        />
      )}
    </Box>
  );
}
