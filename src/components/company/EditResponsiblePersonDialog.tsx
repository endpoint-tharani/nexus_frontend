import { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  TextField,
  CircularProgress,
} from "@mui/material";
import type { Company } from "../../types";

interface EditResponsiblePersonDialogProps {
  open: boolean;
  onClose: () => void;
  company: Company;
  onSave: (updatedData: Partial<Company>) => void;
  loading?: boolean;
}

export default function EditResponsiblePersonDialog({
  open,
  onClose,
  company,
  onSave,
  loading = false,
}: EditResponsiblePersonDialogProps) {
  const current = company.responsiblePerson;
  const [name, setName] = useState(current?.name || "");
  const [designation, setDesignation] = useState(current?.designation || "");
  const [pan, setPan] = useState(current?.pan || "");
  const [email, setEmail] = useState(current?.email || "");
  const [phone, setPhone] = useState(current?.phone || "");
  const [address, setAddress] = useState(current?.address || "");

  useEffect(() => {
    if (company?.responsiblePerson) {
      setName(company.responsiblePerson.name || "");
      setDesignation(company.responsiblePerson.designation || "");
      setPan(company.responsiblePerson.pan || "");
      setEmail(company.responsiblePerson.email || "");
      setPhone(company.responsiblePerson.phone || "");
      setAddress(company.responsiblePerson.address || "");
    }
  }, [company, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      responsiblePerson: {
        name: name.trim(),
        designation: designation.trim(),
        pan: pan.trim().toUpperCase(),
        email: email.trim(),
        phone: phone.trim(),
        address: address.trim(),
        status: "Active",
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
        Edit Responsible Person / Authorized Signatory
      </DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                required
                fullWidth
                size="small"
                label="Full Legal Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                required
                fullWidth
                size="small"
                label="Corporate Designation"
                value={designation}
                onChange={(e) => setDesignation(e.target.value)}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                required
                fullWidth
                size="small"
                label="Officer PAN"
                value={pan}
                onChange={(e) => setPan(e.target.value.toUpperCase())}
                placeholder="ABCPK9981K"
                slotProps={{ input: { sx: { fontFamily: "monospace" } } }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                size="small"
                label="Official Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                size="small"
                label="Direct Phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                size="small"
                label="Official Address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
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
            {loading ? <CircularProgress size={18} color="inherit" /> : "Save Responsible Person"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
