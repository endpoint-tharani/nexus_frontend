import { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  TextField,
  MenuItem,
  FormControlLabel,
  Switch,
  CircularProgress,
} from "@mui/material";
import type { Company } from "../../types";

interface EditPayrollSettingsDialogProps {
  open: boolean;
  onClose: () => void;
  company: Company;
  onSave: (updatedData: Partial<Company>) => void;
  loading?: boolean;
}

export default function EditPayrollSettingsDialog({
  open,
  onClose,
  company,
  onSave,
  loading = false,
}: EditPayrollSettingsDialogProps) {
  const pConfig = company.payrollConfig || {};
  const [cycle, setCycle] = useState(pConfig.cycle || "Monthly");
  const [mode, setMode] = useState(pConfig.mode || "Attendance & LOP Driven");
  const [salaryImport, setSalaryImport] = useState(pConfig.salaryImport !== false);
  const [attendanceIntegration, setAttendanceIntegration] = useState(pConfig.attendanceIntegration !== false);
  const [arrearsSupport, setArrearsSupport] = useState(pConfig.arrearsSupport !== false);
  const [bonusSupport, setBonusSupport] = useState(pConfig.bonusSupport !== false);

  useEffect(() => {
    if (company?.payrollConfig) {
      setCycle(company.payrollConfig.cycle || "Monthly");
      setMode(company.payrollConfig.mode || "Attendance & LOP Driven");
      setSalaryImport(company.payrollConfig.salaryImport !== false);
      setAttendanceIntegration(company.payrollConfig.attendanceIntegration !== false);
      setArrearsSupport(company.payrollConfig.arrearsSupport !== false);
      setBonusSupport(company.payrollConfig.bonusSupport !== false);
    }
  }, [company, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      payrollConfig: {
        cycle,
        mode,
        salaryImport,
        attendanceIntegration,
        arrearsSupport,
        bonusSupport,
        previousEmploymentSupport: true,
      },
    });
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      slotProps={{ paper: { sx: { borderRadius: "12px", p: 1 } } }}
    >
      <DialogTitle sx={{ fontWeight: 700, fontSize: "18px" }}>
        Manage Payroll Configuration &amp; Processing Rules
      </DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                select
                size="small"
                label="Payroll Cycle Frequency"
                value={cycle}
                onChange={(e) => setCycle(e.target.value)}
              >
                <MenuItem value="Monthly">Monthly</MenuItem>
                <MenuItem value="Bi-Weekly">Bi-Weekly</MenuItem>
                <MenuItem value="Weekly">Weekly</MenuItem>
              </TextField>
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                select
                size="small"
                label="Payroll Processing Mode"
                value={mode}
                onChange={(e) => setMode(e.target.value)}
              >
                <MenuItem value="Attendance & LOP Driven">Attendance &amp; LOP Driven</MenuItem>
                <MenuItem value="Fixed Salary Master">Fixed Salary Master</MenuItem>
                <MenuItem value="Hourly Rate">Hourly Rate</MenuItem>
              </TextField>
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <FormControlLabel
                control={<Switch checked={salaryImport} onChange={(e) => setSalaryImport(e.target.checked)} color="primary" />}
                label="Enable Salary Excel Bulk Import"
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <FormControlLabel
                control={<Switch checked={attendanceIntegration} onChange={(e) => setAttendanceIntegration(e.target.checked)} color="primary" />}
                label="Auto-Sync Biometric Attendance"
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <FormControlLabel
                control={<Switch checked={arrearsSupport} onChange={(e) => setArrearsSupport(e.target.checked)} color="primary" />}
                label="Enable Salary Arrears (Sec 89)"
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <FormControlLabel
                control={<Switch checked={bonusSupport} onChange={(e) => setBonusSupport(e.target.checked)} color="primary" />}
                label="Enable Bonus &amp; Variable Pay"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
          <Button variant="outlined" size="small" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            size="small"
            disabled={loading}
            sx={{ bgcolor: "primary.main", color: "primary.contrastText", fontWeight: 600, px: 3 }}
          >
            {loading ? <CircularProgress size={18} color="inherit" /> : "Save Payroll Settings"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
