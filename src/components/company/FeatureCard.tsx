import { useState } from "react";
import { Box, Switch, Typography, List, ListItem, ListItemIcon, ListItemText, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Button, CircularProgress } from "@mui/material";
import LockOpenOutlined from "@mui/icons-material/LockOpenOutlined";
import LockOutlined from "@mui/icons-material/LockOutlined";
import CheckCircleOutlined from "@mui/icons-material/CheckCircleOutlined";
import toast from "react-hot-toast";

import { SectionCard } from "../ui";
import { useUpdateCompany } from "../../hooks/company";
import { useCompanyStore } from "../../store/company.store";
import { getErrorMessage } from "../../utils/errorHandler";
import type { Company } from "../../types";

interface FeatureCardProps {
  company: Company;
}

export default function FeatureCard({ company }: FeatureCardProps) {
  const updateMutation = useUpdateCompany();
  const setCompany = useCompanyStore((s) => s.setCompany);
  const { isPending } = updateMutation;

  const open = company.employeeViewEnabled !== false;
  const [confirmOpen, setConfirmOpen] = useState(false);

  const handleToggle = (checked: boolean) => {
    // If turning OFF, intercept and confirm
    if (!checked) {
      setConfirmOpen(true);
    } else {
      executeMutation(true);
    }
  };

  const executeMutation = (checked: boolean) => {
    updateMutation.mutate(
      { employeeViewEnabled: checked },
      {
        onSuccess: (updated) => {
          setCompany(updated);
          setConfirmOpen(false);
          toast.success(
            checked
              ? "Employee self-service has been enabled"
              : "Employee self-service has been disabled"
          );
        },
        onError: (error) => {
          toast.error(getErrorMessage(error));
          setConfirmOpen(false);
        },
      }
    );
  };

  const benefits = [
    "Employees can download monthly salary slips autonomously.",
    "Employees can declare investments and upload approval forms.",
    "Drastically reduces manual operations for payroll admins.",
  ];

  return (
    <SectionCard
      title="Employee Self Service Platform"
      subtitle="Workspace-wide control panel for employee-facing services."
      actions={
        <Switch
          size="medium"
          checked={open}
          onChange={(_, checked) => handleToggle(checked)}
          disabled={isPending}
          slotProps={{
            input: {
              "aria-label": "Toggle employee self-service access",
            },
          }}
          sx={{
            "& .MuiSwitch-switchBase.Mui-checked": { color: "#2563EB" },
            "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": { bgcolor: "#2563EB" },
          }}
        />
      }
    >
      <Box sx={{ display: "flex", gap: 3, flexDirection: { xs: "column", md: "row" }, alignItems: "flex-start", mt: 1 }}>
        <Box
          sx={{
            width: 48,
            height: 48,
            borderRadius: "10px",
            bgcolor: open ? "rgba(22, 163, 74, 0.08)" : "rgba(148, 163, 184, 0.08)",
            color: open ? "#16A34A" : "#94A3B8",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          {open ? <LockOpenOutlined sx={{ fontSize: 24 }} /> : <LockOutlined sx={{ fontSize: 24 }} />}
        </Box>

        <Box sx={{ flexGrow: 1 }}>
          <Typography variant="body2" sx={{ fontWeight: 600, color: "#111827", mb: 0.5 }}>
            Status: {open ? "Active & Open" : "Locked / Deactivated"}
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 2, maxWidth: 640 }}>
            Configure whether members of the workspace can access self-service pages (My Tax Declaration &amp; Pay Statements). Turning this off locks these systems instantly.
          </Typography>

          <Typography variant="body2" sx={{ fontWeight: 600, color: "#475569", mb: 1 }}>
            Key Platform Benefits:
          </Typography>
          <List dense sx={{ p: 0 }}>
            {benefits.map((benefit, index) => (
              <ListItem key={index} sx={{ p: 0, mb: 1, alignItems: "flex-start" }}>
                <ListItemIcon sx={{ minWidth: 28, mt: 0.25 }}>
                  <CheckCircleOutlined sx={{ fontSize: 16, color: "#16A34A" }} />
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Typography variant="caption" sx={{ color: "#475569", fontWeight: 500 }}>
                      {benefit}
                    </Typography>
                  }
                />
              </ListItem>
            ))}
          </List>
        </Box>
      </Box>

      {/* Warning confirmation dialog */}
      <Dialog
        open={confirmOpen}
        onClose={isPending ? undefined : () => setConfirmOpen(false)}
        maxWidth="xs"
        fullWidth
        slotProps={{ paper: { sx: { borderRadius: "12px" } } }}
      >
        <DialogTitle sx={{ fontWeight: 700, color: "#DC2626", fontSize: "18px" }}>
          Disable Employee Self-Service?
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ fontSize: "14px", color: "#475569" }}>
            This will immediately lock pay statement logs and tax declaration filing processes for all employees. Your workforce will lose access to their documents.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
          <Button
            variant="outlined"
            onClick={() => setConfirmOpen(false)}
            disabled={isPending}
            sx={{
              borderColor: "#E5E7EB",
              color: "#475569",
              borderRadius: "8px",
              textTransform: "none",
            }}
          >
            Cancel
          </Button>
          <Button
            color="error"
            variant="contained"
            onClick={() => executeMutation(false)}
            disabled={isPending}
            sx={{
              bgcolor: "#DC2626",
              borderRadius: "8px",
              textTransform: "none",
              boxShadow: "none",
              minWidth: 100,
              "&:hover": { bgcolor: "#B91C1C", boxShadow: "none" },
            }}
          >
            {isPending ? <CircularProgress size={20} color="inherit" /> : "Disable"}
          </Button>
        </DialogActions>
      </Dialog>
    </SectionCard>
  );
}
