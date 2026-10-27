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

interface EditTaxSettingsDialogProps {
  open: boolean;
  onClose: () => void;
  company: Company;
  onSave: (updatedData: Partial<Company>) => void;
  loading?: boolean;
}

export default function EditTaxSettingsDialog({
  open,
  onClose,
  company,
  onSave,
  loading = false,
}: EditTaxSettingsDialogProps) {
  const [fyStartMonth, setFyStartMonth] = useState<number>(company.financialYearStartMonth ?? 4);
  const [declarationWindowOpen, setDeclarationWindowOpen] = useState<boolean>(company.employeeViewEnabled !== false);

  useEffect(() => {
    if (company) {
      setFyStartMonth(company.financialYearStartMonth ?? 4);
      setDeclarationWindowOpen(company.employeeViewEnabled !== false);
    }
  }, [company, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      financialYearStartMonth: fyStartMonth,
      employeeViewEnabled: declarationWindowOpen,
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
        Configure Tax &amp; Financial Year Settings
      </DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          <Grid container spacing={2.5}>
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                select
                size="small"
                label="Financial Year Start Month"
                value={fyStartMonth}
                onChange={(e) => setFyStartMonth(Number(e.target.value))}
                helperText="Standard Indian Financial Year starts in April (FY 2026-27)"
              >
                <MenuItem value={1}>January</MenuItem>
                <MenuItem value={4}>April (Standard Indian Financial Year)</MenuItem>
                <MenuItem value={7}>July</MenuItem>
                <MenuItem value={10}>October</MenuItem>
              </TextField>
            </Grid>

            <Grid size={{ xs: 12 }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={declarationWindowOpen}
                    onChange={(e) => setDeclarationWindowOpen(e.target.checked)}
                    color="primary"
                  />
                }
                label="Enable Employee Tax Declaration Window (My Tax Portal)"
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
            {loading ? <CircularProgress size={18} color="inherit" /> : "Save Tax Settings"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
