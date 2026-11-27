import { useState } from "react";
import type { FormEvent } from "react";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { Alert, Box, Button, Link, Paper, Stack, TextField, Typography } from "@mui/material";
import { completeStudentSetup, requestStudentSetup } from "../../api/auth.api";
import { getErrorMessage } from "../../utils/errorHandler";

export default function StudentAccountSetup() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [step, setStep] = useState<"request" | "complete">("request");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); setBusy(true); setError(""); setNotice("");
    try {
      if (step === "request") {
        await requestStudentSetup(email.trim());
        setNotice("If this email has an eligible student account, a setup code has been sent.");
        setStep("complete");
      } else {
        await completeStudentSetup(email.trim(), otp.trim(), password);
        navigate("/login", { replace: true, state: { message: "Student account setup is complete. Sign in with your new password." } });
      }
    } catch (cause) { setError(getErrorMessage(cause)); }
    finally { setBusy(false); }
  };

  return <Box sx={{ maxWidth: 480, mx: "auto", px: 2, py: { xs: 4, md: 8 } }}>
    <Paper variant="outlined" sx={{ p: { xs: 2.5, sm: 4 }, borderRadius: 3 }}>
      <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>Set up student account</Typography>
      <Typography color="text.secondary" sx={{ mb: 3 }}>Staff-created student accounts need a one-time emailed code before password sign-in.</Typography>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {notice && <Alert severity="info" sx={{ mb: 2 }}>{notice}</Alert>}
      <Stack component="form" spacing={2} onSubmit={submit}>
        <TextField label="Student email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required disabled={step === "complete"} />
        {step === "complete" && <>
          <TextField label="6-digit setup code" value={otp} onChange={(event) => setOtp(event.target.value)} required slotProps={{ htmlInput: { maxLength: 6, inputMode: "numeric" } }} />
          <TextField label="New password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} required slotProps={{ htmlInput: { minLength: 8, maxLength: 72 } }} />
        </>}
        <Button type="submit" variant="contained" size="large" disabled={busy}>{busy ? "Please wait…" : step === "request" ? "Email setup code" : "Set password"}</Button>
        {step === "complete" && <Button disabled={busy} onClick={() => { setStep("request"); setNotice(""); }}>Send another code</Button>}
      </Stack>
      <Typography variant="body2" sx={{ mt: 3, textAlign: "center" }}><Link component={RouterLink} to="/login">Back to sign in</Link></Typography>
    </Paper>
  </Box>;
}
