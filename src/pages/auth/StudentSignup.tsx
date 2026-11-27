import { useState } from "react";
import type { FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { Alert, Box, Button, Paper, Stack, TextField, Typography } from "@mui/material";
import toast from "react-hot-toast";
import { studentSignup } from "../../api/student.api";
import { getErrorMessage } from "../../utils/errorHandler";

export default function StudentSignup() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ code: "", name: "", email: "", password: "", admissionNumber: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [registrationStatus, setRegistrationStatus] = useState<string | null>(null);
  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true); setError("");
    try {
      const response = await studentSignup({ ...form, code: form.code.trim(), name: form.name.trim(), email: form.email.trim(), admissionNumber: form.admissionNumber.trim(), departmentIds: [] });
      setRegistrationStatus(response.data.data.status ?? "ACTIVE");
      toast.success("Student registration submitted");
    } catch (cause) {
      const message = getErrorMessage(cause);
      setError(message);
    } finally { setLoading(false); }
  };
  return <Box sx={{ maxWidth: 480, mx: "auto", px: 2, py: { xs: 4, md: 8 } }}>
    <Paper variant="outlined" sx={{ p: { xs: 2.5, sm: 4 }, borderRadius: 3 }}>
      <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>Student registration</Typography>
      <Typography color="text.secondary" sx={{ mb: 3 }}>Use the admission code provided by your school.</Typography>
      {registrationStatus && <Stack spacing={2}><Alert severity={registrationStatus === "PENDING_APPROVAL" ? "info" : "success"}>{registrationStatus === "PENDING_APPROVAL" ? "Registration submitted. Verify your email; sign-in will be available after school approval." : "Account created. Verify your email before signing in."}</Alert><Button variant="contained" onClick={() => navigate(`/verify-email?email=${encodeURIComponent(form.email.trim())}`, { replace: true })}>Verify email</Button></Stack>}
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {!registrationStatus && <Stack component="form" spacing={2} onSubmit={submit}>
        <TextField label="Admission code" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} required />
        <TextField label="Full name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
        <TextField label="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
        <TextField label="Admission number" value={form.admissionNumber} onChange={(e) => setForm({ ...form, admissionNumber: e.target.value })} required />
        <TextField label="Password" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required slotProps={{ htmlInput: { minLength: 8 } }} />
        <Button type="submit" variant="contained" size="large" disabled={loading}>{loading ? "Creating account…" : "Create student account"}</Button>
      </Stack>}
    </Paper>
  </Box>;
}
