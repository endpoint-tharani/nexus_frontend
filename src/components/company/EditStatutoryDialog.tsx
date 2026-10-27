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
  CircularProgress,
} from "@mui/material";
import type { Company } from "../../types";

interface EditStatutoryDialogProps {
  open: boolean;
  onClose: () => void;
  company: Company;
  onSave: (updatedData: Partial<Company>) => void;
  loading?: boolean;
}

export default function EditStatutoryDialog({
  open,
  onClose,
  company,
  onSave,
  loading = false,
}: EditStatutoryDialogProps) {
  const [pan, setPan] = useState(company.pan || "");
  const [tan, setTan] = useState(company.tan || "");
  const [deductorType, setDeductorType] = useState(company.deductorType || "Company");
  const [deductorCategory, setDeductorCategory] = useState(company.deductorCategory || "Private Enterprise");
  const [tdsCircle, setTdsCircle] = useState(company.tdsCircle || "");
  const [gstin, setGstin] = useState(company.gstin || "");
  const [pfReg, setPfReg] = useState(company.pfRegistrationNo || "");
  const [esiReg, setEsiReg] = useState(company.esiRegistrationNo || "");
  const [ptReg, setPtReg] = useState(company.ptRegistrationNo || "");

  useEffect(() => {
    if (company) {
      setPan(company.pan || "");
      setTan(company.tan || "");
      setDeductorType(company.deductorType || "Company");
      setDeductorCategory(company.deductorCategory || "Private Enterprise");
      setTdsCircle(company.tdsCircle || "");
      setGstin(company.gstin || "");
      setPfReg(company.pfRegistrationNo || "");
      setEsiReg(company.esiRegistrationNo || "");
      setPtReg(company.ptRegistrationNo || "");
    }
  }, [company, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      pan: pan.trim().toUpperCase(),
      tan: tan.trim().toUpperCase(),
      deductorType: deductorType as Company["deductorType"],
      deductorCategory: deductorCategory.trim(),
      tdsCircle: tdsCircle.trim(),
      gstin: gstin.trim().toUpperCase(),
      pfRegistrationNo: pfReg.trim(),
      esiRegistrationNo: esiReg.trim(),
      ptRegistrationNo: ptReg.trim(),
    });
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      slotProps={{ paper: { sx: { borderRadius: "12px", p: 1 } } }}
    >
      <DialogTitle sx={{ fontWeight: 700, fontSize: "18px" }}>
        Edit Statutory &amp; TDS Registration Details
      </DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                size="small"
                label="Company TAN (Tax Deduction Account)"
                value={tan}
                onChange={(e) => setTan(e.target.value.toUpperCase())}
                placeholder="AAAA11111A"
                slotProps={{ input: { sx: { fontFamily: "monospace" } } }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                size="small"
                label="Company PAN (Permanent Account)"
                value={pan}
                onChange={(e) => setPan(e.target.value.toUpperCase())}
                placeholder="ABCDE1234F"
                slotProps={{ input: { sx: { fontFamily: "monospace" } } }}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                select
                size="small"
                label="Deductor Type"
                value={deductorType}
                onChange={(e) => setDeductorType(e.target.value as NonNullable<Company["deductorType"]>)}
              >
                <MenuItem value="Company">Company (Corporate Body)</MenuItem>
                <MenuItem value="Government">Government</MenuItem>
                <MenuItem value="Others">Others (Individual / Firm)</MenuItem>
              </TextField>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                size="small"
                label="Deductor Category"
                value={deductorCategory}
                onChange={(e) => setDeductorCategory(e.target.value)}
                placeholder="e.g. Private Enterprise"
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                size="small"
                label="TDS Circle / Assessing Officer (AO) Info"
                value={tdsCircle}
                onChange={(e) => setTdsCircle(e.target.value)}
                placeholder="e.g. Ward 12(1) Chennai"
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                size="small"
                label="GSTIN (Goods and Services Tax Number)"
                value={gstin}
                onChange={(e) => setGstin(e.target.value.toUpperCase())}
                placeholder="33AAAAA0000A1Z5"
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField
                fullWidth
                size="small"
                label="PF Registration Number"
                value={pfReg}
                onChange={(e) => setPfReg(e.target.value)}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField
                fullWidth
                size="small"
                label="ESI Registration Number"
                value={esiReg}
                onChange={(e) => setEsiReg(e.target.value)}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField
                fullWidth
                size="small"
                label="Professional Tax Registration"
                value={ptReg}
                onChange={(e) => setPtReg(e.target.value)}
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
            {loading ? <CircularProgress size={18} color="inherit" /> : "Save Changes"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
