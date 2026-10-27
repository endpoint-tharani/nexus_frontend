import React, { useMemo } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  IconButton,
  Typography,
  Alert,
  Skeleton,
  Tooltip,
} from "@mui/material";
import { MdPrint, MdArrowBack, MdRefresh } from "react-icons/md";
import { useForm16 } from "../../../hooks/payroll";
import { Form16Template } from "./Form16Template";
import { Form16DownloadButton } from "./Form16DownloadButton";
import { getFinancialYear } from "../../../utils/format";
import "./form16.css";

// Helper to convert number to financial year string (e.g. 2025 -> "2025-26")
const toFyString = (year: number): string => {
  const nextYearShort = String((year + 1) % 100).padStart(2, "0");
  return `${year}-${nextYearShort}`;
};

export const Form16Page: React.FC = () => {
  const { employeeId } = useParams<{ employeeId: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const currentYear = getFinancialYear(new Date());
  const financialYear = useMemo(() => {
    return searchParams.get("financialYear") || toFyString(currentYear);
  }, [searchParams, currentYear]);

  // Load Form 16 data using React Query
  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
  } = useForm16(employeeId, financialYear);

  const handlePrint = () => {
    window.print();
  };

  const handleBack = () => {
    navigate(-1);
  };

  if (isLoading) {
    return (
      <Box className="form16-viewer-root" sx={{ p: 4 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
          <Skeleton width={120} height={40} />
          <Box sx={{ display: "flex", gap: 1 }}>
            <Skeleton width={100} height={40} />
            <Skeleton width={120} height={40} />
          </Box>
        </Box>
        <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", mt: 4 }}>
          <Skeleton variant="rectangular" width="210mm" height="297mm" sx={{ borderRadius: 1 }} />
        </Box>
      </Box>
    );
  }

  if (isError) {
    return (
      <Box className="form16-viewer-root" sx={{ p: 4, display: "flex", justifyContent: "center", alignItems: "center" }}>
        <Box sx={{ maxWidth: 500, width: "100%" }}>
          <Alert
            severity="error"
            action={
              <Button color="inherit" size="small" onClick={() => refetch()} startIcon={<MdRefresh />}>
                Retry
              </Button>
            }
          >
            <Typography variant="subtitle2" sx={{ fontWeight: "bold" }}>
              Error loading Form 16
            </Typography>
            <Typography variant="body2" sx={{ mt: 0.5 }}>
              {error instanceof Error ? error.message : "An unexpected error occurred while fetching Form 16 details."}
            </Typography>
          </Alert>
          <Button startIcon={<MdArrowBack />} onClick={handleBack} sx={{ mt: 2 }} color="primary">
            Go Back
          </Button>
        </Box>
      </Box>
    );
  }

  if (!data) {
    return (
      <Box className="form16-viewer-root" sx={{ p: 4, display: "flex", justifyContent: "center", alignItems: "center" }}>
        <Box sx={{ maxWidth: 500, width: "100%", textAlign: "center" }}>
          <Alert severity="warning">
            <Typography variant="subtitle2" sx={{ fontWeight: "bold" }}>
              No Form 16 Data Found
            </Typography>
            <Typography variant="body2" sx={{ mt: 0.5 }}>
              No Form 16 has been generated for employee code {employeeId} in financial year {financialYear}.
            </Typography>
          </Alert>
          <Button startIcon={<MdArrowBack />} onClick={handleBack} sx={{ mt: 2 }} color="primary">
            Go Back
          </Button>
        </Box>
      </Box>
    );
  }

  return (
    <Box className="form16-viewer-root">
      {/* 10. Toolbar */}
      <Box className="form16-toolbar no-print">
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <IconButton onClick={handleBack} size="small" sx={{ border: "1px solid", borderColor: "divider" }}>
            <MdArrowBack />
          </IconButton>
          <Box>
            <Typography variant="h6" sx={{ fontSize: "16px", fontWeight: "bold", lineHeight: 1.2 }}>
              Form 16 Certificate
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Employee: {data.employee.name} ({data.employee.employeeCode}) | FY: {financialYear}
            </Typography>
          </Box>
        </Box>

        <Box sx={{ display: "flex", gap: 1.5, alignItems: "center" }}>
          <Tooltip title="Print Form 16">
            <span>
              <Button
                variant="outlined"
                color="secondary"
                startIcon={<MdPrint />}
                onClick={handlePrint}
              >
                Print
              </Button>
            </span>
          </Tooltip>

          <Form16DownloadButton
            employeeCode={data.employee.employeeCode || "EMP"}
            financialYear={financialYear}
          />
        </Box>
      </Box>

      {/* 10. Form16Template (Scroll Container) */}
      <Box className="form16-scroll-container">
        <Form16Template data={data} />
      </Box>
    </Box>
  );
};

export default Form16Page;
