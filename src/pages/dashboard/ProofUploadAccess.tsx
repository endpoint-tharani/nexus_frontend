import { useState } from "react";
import {
  Alert,
  Box,
  CircularProgress,
  FormControlLabel,
  MenuItem,
  Stack,
  Switch,
  TextField,
  Typography,
} from "@mui/material";
import { PageHeader, SectionCard } from "../../components/ui";
import { useProofUploadWindow, useSetProofUploadWindow } from "../../hooks/taxConfig";
import { financialYearOptions, getFinancialYear } from "../../utils/format";
import toast from "react-hot-toast";
import { getErrorMessage } from "../../utils/errorHandler";

const CURRENT_FY = getFinancialYear(new Date());
const FY_OPTIONS = financialYearOptions(CURRENT_FY, 5);

export default function ProofUploadAccess() {
  const [year, setYear] = useState<number>(CURRENT_FY);
  const { data, isLoading, isError, refetch } = useProofUploadWindow(year);
  const toggle = useSetProofUploadWindow();

  const isOpen = data ? data.proofUploadOpen : false;

  const handleToggle = () => {
    toggle.mutate(
      {
        year,
        proofUploadOpen: !isOpen,
      },
      {
        onSuccess: (res) => {
          toast.success(
            `Proof upload window is now ${res.proofUploadOpen ? "OPEN" : "CLOSED"}`
          );
        },
        onError: (e) => toast.error(getErrorMessage(e)),
      }
    );
  };

  const breadcrumbs = [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Tax Management" },
    { label: "Proof Upload Access" },
  ];

  return (
    <Box sx={{ p: 0 }}>
      <PageHeader
        title="Proof Upload Access"
        subtitle="Control whether employees can upload tax proof documents."
        breadcrumbs={breadcrumbs}
        actions={
          <TextField
            select
            label="Financial Year"
            size="small"
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
            sx={{ minWidth: 200 }}
          >
            {FY_OPTIONS.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </TextField>
        }
      />

      {isLoading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
          <CircularProgress />
        </Box>
      ) : isError ? (
        <Alert
          severity="error"
          sx={{ mb: 2 }}
          action={
            <FormControlLabel
              control={<Switch checked={false} disabled />}
              label="Retry"
              onClick={() => refetch()}
            />
          }
        >
          Failed to load settings. Please try again.
        </Alert>
      ) : (
        <Box sx={{ maxWidth: 600 }}>
          <SectionCard
            title="Proof Upload Window"
            subtitle="Proof Upload Window"
          >
            <Stack spacing={3}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                <Typography variant="body2" sx={{ fontWeight: 600, color: "text.primary" }}>
                  Status:
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 0.5,
                    fontWeight: 700,
                  }}
                >
                  {isOpen ? (
                    <Typography component="span" sx={{ color: "success.main", fontWeight: 700 }}>
                      🟢 Open
                    </Typography>
                  ) : (
                    <Typography component="span" sx={{ color: "error.main", fontWeight: 700 }}>
                      🔴 Closed
                    </Typography>
                  )}
                </Typography>
              </Box>

              <Typography variant="body2" color="text.secondary">
                {isOpen
                  ? "Employees can upload, replace and delete proof documents."
                  : "Employees cannot upload, replace or delete proofs."}
              </Typography>

              <Box sx={{ display: "flex", justifyContent: "flex-start" }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={isOpen}
                      onChange={handleToggle}
                      disabled={toggle.isPending}
                      color="primary"
                    />
                  }
                  label={isOpen ? "Open for uploads" : "Closed for uploads"}
                  sx={{ ml: 0 }}
                />
              </Box>
            </Stack>
          </SectionCard>
        </Box>
      )}
    </Box>
  );
}
