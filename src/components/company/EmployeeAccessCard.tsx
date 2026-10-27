import { Box, Paper, Switch, Typography } from "@mui/material";
import { MdLockOpen, MdLockOutline } from "react-icons/md";
import toast from "react-hot-toast";

import { useUpdateCompany } from "../../hooks/company";
import { useCompanyStore } from "../../store/company.store";
import type { Company } from "../../types";
import { getErrorMessage } from "../../utils/errorHandler";

export interface EmployeeAccessCardProps {
  company: Company;
}

// Admin control for employee self-service access (My Tax + My Pay Statement).
// One company-wide switch: ON lets login-enabled employees view their pay
// statement and submit tax declarations; OFF locks those pages for the whole
// team. An absent flag is treated as ON (open) so existing behavior is
// preserved until an admin sets it. Self-contained: owns the update mutation and
// syncs the company store on success so the change takes effect immediately.
export default function EmployeeAccessCard({ company }: EmployeeAccessCardProps) {
  const updateMutation = useUpdateCompany();
  const setCompany = useCompanyStore((s) => s.setCompany);
  const { isPending } = updateMutation;

  // Open unless explicitly disabled.
  const open = company.employeeViewEnabled !== false;

  const handleToggle = (checked: boolean) => {
    updateMutation.mutate(
      { employeeViewEnabled: checked },
      {
        onSuccess: (updated) => {
          setCompany(updated);
          toast.success(
            checked
              ? "Employee self-service enabled"
              : "Employee self-service disabled"
          );
        },
        onError: (error) => toast.error(getErrorMessage(error)),
      }
    );
  };

  return (
    <Paper
      elevation={0}
      sx={{
        p: 2.5,
        borderRadius: 3,
        border: "1px solid",
        borderColor: "divider",
      }}
    >
      <Box sx={{ display: "flex", gap: 1.25, alignItems: "flex-start" }}>
        <Box
          aria-hidden
          sx={{
            display: "flex",
            color: open ? "success.main" : "text.disabled",
            mt: 0.25,
          }}
        >
          {open ? <MdLockOpen size={20} /> : <MdLockOutline size={20} />}
        </Box>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: 1.5,
            }}
          >
            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
              Employee self-service
            </Typography>
            <Switch
              size="small"
              checked={open}
              onChange={(_, checked) => handleToggle(checked)}
              disabled={isPending}
              slotProps={{
                input: {
                  "aria-label": "Toggle employee self-service access",
                },
              }}
            />
          </Box>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25 }}>
            {open
              ? "Login-enabled employees can view their pay statement and submit tax declarations. Turn off to lock those pages for everyone."
              : "Employee access is off. Your team can't view pay statements or submit declarations until you turn it back on."}
          </Typography>
        </Box>
      </Box>
    </Paper>
  );
}
