import { useState } from "react";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import WarningAmberOutlined from "@mui/icons-material/WarningAmberOutlined";
import toast from "react-hot-toast";

import { useDeleteCompany } from "../../hooks/company";
import type { Company } from "../../types";
import { getErrorMessage } from "../../utils/errorHandler";

export interface CompanyDangerZoneProps {
  company: Company | null;
  onDeleted?: () => void;
}

export default function CompanyDangerZone({ company, onDeleted }: CompanyDangerZoneProps) {
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const deleteMutation = useDeleteCompany();
  const { isPending } = deleteMutation;

  const companyName = company?.name ?? "";
  const canDelete = Boolean(company && confirmText.trim() === companyName && companyName.length > 0);

  const handleClose = () => {
    if (isPending) return;
    setOpenDeleteDialog(false);
    setConfirmText("");
  };

  const handleConfirmDelete = () => {
    if (!canDelete) return;
    deleteMutation.mutate(undefined, {
      onSuccess: () => {
        toast.success("Company deleted permanently");
        setOpenDeleteDialog(false);
        setConfirmText("");
        onDeleted?.();
      },
      onError: (error) => toast.error(getErrorMessage(error)),
    });
  };

  const handleDeactivate = () => {
    toast.error("Company deactivation requires Super Admin approval");
  };

  return (
    <Paper
      elevation={0}
      sx={{
        p: 2.5,
        borderRadius: "8px",
        border: "1px solid",
        borderColor: (theme) => (theme.palette.mode === "dark" ? "rgba(239, 68, 68, 0.3)" : "#FECDD3"),
        bgcolor: "background.paper",
      }}
    >
      <Box sx={{ display: "flex", gap: 1.75, alignItems: "flex-start" }}>
        <WarningAmberOutlined sx={{ color: "error.main", mt: 0.25, fontSize: 20 }} />
        <Box sx={{ flex: 1 }}>
          <Typography
            variant="subtitle1"
            sx={{
              fontWeight: 600,
              color: (theme) => (theme.palette.mode === "dark" ? "#FCA5A5" : "#991B1B"),
              fontSize: "15px",
            }}
          >
            Danger Zone
          </Typography>

          <Typography variant="body2" sx={{ mt: 0.25, mb: 1.75, color: "text.secondary", fontSize: "13px" }}>
            Deactivate or permanently delete this company and all associated statutory data.
          </Typography>

          <Stack direction="row" spacing={1.5}>
            <Button
              variant="outlined"
              size="small"
              onClick={handleDeactivate}
              sx={{
                height: "32px",
                borderColor: (theme) => (theme.palette.mode === "dark" ? "rgba(249, 115, 22, 0.4)" : "#FDBA74"),
                color: (theme) => (theme.palette.mode === "dark" ? "#FB923C" : "#C2410C"),
                fontWeight: 600,
                fontSize: "12.5px",
                borderRadius: "6px",
                textTransform: "none",
                "&:hover": {
                  bgcolor: (theme) => (theme.palette.mode === "dark" ? "rgba(249, 115, 22, 0.15)" : "#FFFBEB"),
                  borderColor: (theme) => (theme.palette.mode === "dark" ? "#FB923C" : "#F97316"),
                },
              }}
            >
              Deactivate
            </Button>

            <Button
              color="error"
              variant="outlined"
              size="small"
              disabled={!company}
              onClick={() => setOpenDeleteDialog(true)}
              sx={{
                height: "32px",
                borderColor: (theme) => (theme.palette.mode === "dark" ? "rgba(239, 68, 68, 0.4)" : "#FCA5A5"),
                color: (theme) => (theme.palette.mode === "dark" ? "#F87171" : "#DC2626"),
                fontWeight: 600,
                fontSize: "12.5px",
                borderRadius: "6px",
                textTransform: "none",
                "&:hover": {
                  bgcolor: (theme) => (theme.palette.mode === "dark" ? "rgba(239, 68, 68, 0.15)" : "#FEF2F2"),
                  borderColor: (theme) => (theme.palette.mode === "dark" ? "#F87171" : "#EF4444"),
                },
              }}
            >
              Delete
            </Button>
          </Stack>
        </Box>
      </Box>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={openDeleteDialog}
        onClose={handleClose}
        maxWidth="xs"
        fullWidth
        slotProps={{ paper: { sx: { borderRadius: "8px", bgcolor: "background.paper" } } }}
      >
        <DialogTitle sx={{ fontWeight: 700, color: "error.main", pb: 1, fontSize: "16px" }}>
          Delete Company Permanently
        </DialogTitle>
        <DialogContent>
          <Alert severity="error" sx={{ mb: 2, borderRadius: "6px", fontSize: "13px" }}>
            Deleting this company permanently removes associated company data. This action cannot be undone.
          </Alert>

          <DialogContentText sx={{ mb: 2, color: "text.primary", fontSize: "13px" }}>
            Type the company name <strong>{companyName}</strong> to confirm:
          </DialogContentText>

          <TextField
            fullWidth
            size="small"
            autoFocus
            placeholder={companyName}
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            disabled={isPending}
            slotProps={{
              input: {
                sx: { borderRadius: "6px", fontSize: "13.5px" },
              },
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" && canDelete) handleConfirmDelete();
            }}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
          <Button
            variant="outlined"
            size="small"
            onClick={handleClose}
            disabled={isPending}
            sx={{ borderRadius: "6px", height: "34px", textTransform: "none" }}
          >
            Cancel
          </Button>
          <Button
            color="error"
            variant="contained"
            size="small"
            onClick={handleConfirmDelete}
            disabled={!canDelete || isPending}
            sx={{
              borderRadius: "6px",
              height: "34px",
              textTransform: "none",
              fontWeight: 600,
              bgcolor: "error.main",
              "&:hover": { bgcolor: "error.dark" },
            }}
          >
            {isPending ? <CircularProgress size={18} color="inherit" /> : "Delete Permanently"}
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
}
