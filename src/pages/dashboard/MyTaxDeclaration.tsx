import { useState } from "react";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Divider,
  MenuItem,
  Paper,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material";
import SendOutlinedIcon from "@mui/icons-material/SendOutlined";
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";
import toast from "react-hot-toast";

import {
  IncomeWorksheet,
  MyTaxSummaryCards,
  PreviousEmploymentAccordion,
  FloatingTaxSummary,
  TdsHistorySection,
} from "../../components/meTax";
import { ConfirmDialog, EmployeeViewLocked, StatusChip } from "../../components/ui";
import { useStructuredDeclaration } from "../../hooks/taxStructured";
import { useSubmitDeclaration, useUpdateMyDeclaration } from "../../hooks/meTax";
import { useEmployeeViewLocked } from "../../hooks/shared/useEmployeeViewLocked";
import { useProofUploadWindow } from "../../hooks/taxConfig";
import {
  DeclarationStatus,
  TaxRegime,
  TAX_REGIME_LABELS,
} from "../../constants/enums";
import {
  financialYearOptions,
  formatFinancialYear,
  getFinancialYear,
} from "../../utils/format";
import { getErrorMessage } from "../../utils/errorHandler";

const CURRENT_FY = getFinancialYear(new Date());
const FY_OPTIONS = financialYearOptions(CURRENT_FY, 5);

/**
 * Employee self-service: one tax declaration per financial year, driven
 * end-to-end by the backend's single tax engine (/me/tax/structured).
 *
 * Enterprise redesign: clean header — no icon circle, plain icon, 8px button
 * radius, contained submit with disableElevation.
 */
export default function MyTaxDeclaration() {
  const [year, setYear] = useState<number>(CURRENT_FY);
  const [submitOpen, setSubmitOpen] = useState(false);

  const locked = useEmployeeViewLocked();
  const {
    data: decl,
    isLoading,
    isError,
  } = useStructuredDeclaration(year, undefined, { enabled: !locked });

  const { data: windowConfig } = useProofUploadWindow(year, { enabled: !locked });
  const isWindowClosed = windowConfig ? !windowConfig.proofUploadOpen : false;

  const updateMutation = useUpdateMyDeclaration();
  const submitMutation = useSubmitDeclaration();

  const isEditable =
    !decl?.locked &&
    (decl?.status === DeclarationStatus.DRAFT ||
      decl?.status === DeclarationStatus.REJECTED);

  const isRejected =
    decl?.status === DeclarationStatus.REJECTED &&
    !!decl?.review.rejectionReason;

  const handleRegimeChange = (
    _event: React.MouseEvent<HTMLElement>,
    next: TaxRegime | null
  ) => {
    if (!next || !decl || next === decl.regime) return;
    updateMutation.mutate(
      { year, data: { regime: next } },
      {
        onSuccess: () =>
          toast.success(`Switched to ${TAX_REGIME_LABELS[next]}`),
        onError: (error) => toast.error(getErrorMessage(error)),
      }
    );
  };

  const handleSubmit = () => {
    submitMutation.mutate(year, {
      onSuccess: () => {
        toast.success("Declaration submitted for review");
        setSubmitOpen(false);
      },
      onError: (error) => toast.error(getErrorMessage(error)),
    });
  };

  return (
    <Box sx={{ maxWidth: 1500, mx: "auto", px: { xs: 1, sm: 2 } }}>
      {/* ── Page Header ──────────────────────────────────────────────── */}
      <Paper
        elevation={0}
        sx={{
          border: "none",
          borderRadius: "10px",
          p: { xs: 2, sm: 2.5 },
          mb: 3,
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          gap: 2,
        }}
      >
        {/* Icon + title — no colored circle */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.25, flex: 1, minWidth: 220 }}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              color: "text.secondary",
              flexShrink: 0,
            }}
          >
            <ReceiptLongOutlinedIcon sx={{ fontSize: 20 }} />
          </Box>
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, lineHeight: 1.3 }}>
              My Tax Declaration
            </Typography>
            <Typography variant="caption" color="text.secondary">
              One declaration · One engine · Matches admin view &amp; Form 16
            </Typography>
          </Box>
        </Box>

        {/* Regime selector */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, flexWrap: "wrap" }}>
          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>
            Regime
          </Typography>
          <ToggleButtonGroup
            exclusive
            size="small"
            color="primary"
            value={decl?.regime ?? null}
            onChange={handleRegimeChange}
            disabled={!isEditable || updateMutation.isPending}
            aria-label="Tax regime selector"
            sx={{
              "& .MuiToggleButton-root": {
                borderRadius: "8px",
                px: 1.75,
                py: 0.5,
                fontWeight: 500,
                textTransform: "none",
                border: "1px solid",
                borderColor: "divider",
                color: "text.secondary",
                "&.Mui-selected": {
                  color: "primary.main",
                  bgcolor: "rgba(37,99,235,0.06)",
                  borderColor: "primary.main",
                  fontWeight: 600,
                },
              },
            }}
          >
            <ToggleButton value={TaxRegime.OLD} aria-label="Old regime">
              Old
            </ToggleButton>
            <ToggleButton value={TaxRegime.NEW} aria-label="New regime">
              New
            </ToggleButton>
          </ToggleButtonGroup>
          {updateMutation.isPending && <CircularProgress size={16} />}
        </Box>

        <Divider orientation="vertical" flexItem sx={{ display: { xs: "none", md: "block" } }} />

        {/* FY selector + status + submit */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, flexWrap: "wrap" }}>
          <TextField
            select
            label="Financial Year"
            size="small"
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
            sx={{
              minWidth: 180,
              "& .MuiOutlinedInput-root": {
                borderRadius: "8px",
              },
            }}
            aria-label="Select financial year"
          >
            {FY_OPTIONS.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </TextField>

          {decl && (
            <StatusChip
              status={decl.status}
              kind="declaration"
              variant="outlined"
              sx={{ fontWeight: 600 }}
            />
          )}

          {isEditable && (
            <Button
              variant="contained"
              startIcon={<SendOutlinedIcon sx={{ fontSize: 16 }} />}
              onClick={() => setSubmitOpen(true)}
              disableElevation
              sx={{
                height: 40,
                minWidth: 140,
                fontWeight: 600,
                borderRadius: "8px",
                textTransform: "none",
              }}
              aria-label="Submit tax declaration"
            >
              Submit
            </Button>
          )}
        </Box>
      </Paper>

      {/* ── Body ─────────────────────────────────────────────────────── */}
      {locked ? (
        <EmployeeViewLocked feature="tax declaration" />
      ) : isLoading ? (
        <Box sx={{ py: 10, textAlign: "center" }}>
          <CircularProgress />
        </Box>
      ) : isError || !decl ? (
        <Box sx={{ py: 8, textAlign: "center" }}>
          <Typography color="error" sx={{ fontWeight: 600 }}>
            Failed to load your declaration.
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Please refresh the page and try again.
          </Typography>
        </Box>
      ) : (
        <>
          {/* Rejection banner */}
          {isRejected && (
            <Alert severity="error" sx={{ mb: 3, borderRadius: "8px" }}>
              <strong>Rejection reason:</strong> {decl.review.rejectionReason}
            </Alert>
          )}

          {/* Closed window banner */}
          {isWindowClosed && (
            <Alert severity="warning" sx={{ mb: 3, borderRadius: "8px" }}>
              Proof submission is currently closed by your organization. Please contact HR for assistance.
            </Alert>
          )}

          {/* Summary stat cards */}
          <MyTaxSummaryCards declaration={decl} />

          {/* Two-column layout: main content + sticky sidebar */}
          <Box
            sx={{
              display: "flex",
              gap: 3,
              alignItems: "flex-start",
            }}
          >
            {/* Main content (left / full width on mobile) */}
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                {/* Accordion-based worksheet */}
                <IncomeWorksheet year={year} />

                {/* Previous employment as accordion */}
                <PreviousEmploymentAccordion year={year} />

                {/* TDS deduction history */}
                <TdsHistorySection employeeId={decl.employee.id} year={year} />
              </Box>
            </Box>

            {/* Sticky floating summary — handles mobile/desktop internally */}
            <FloatingTaxSummary declaration={decl} />
          </Box>
        </>
      )}

      {/* Submit confirmation dialog */}
      <ConfirmDialog
        open={submitOpen}
        title="Submit declaration"
        message={
          <>
            Submit your <strong>{formatFinancialYear(year)}</strong> tax
            declaration for review? Once submitted, you can no longer edit it
            until it is reviewed.
          </>
        }
        confirmLabel="Submit"
        severity="primary"
        loading={submitMutation.isPending}
        onConfirm={handleSubmit}
        onClose={() => setSubmitOpen(false)}
      />
    </Box>
  );
}
