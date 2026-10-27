import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Box, Alert, Typography } from "@mui/material";
import toast from "react-hot-toast";

import {
  AuthLayout,
  AuthCard,
  AuthHeader,
  OtpInput,
  PrimaryButton,
  SecondaryButton,
  AuthFooter,
} from "../../components/auth";
import { verifyEmail, sendVerificationEmail } from "../../api/auth.api";
import { getErrorMessage } from "../../utils/errorHandler";

const OTP_LENGTH = 6;

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const email = searchParams.get("email") || "";
  const navigate = useNavigate();

  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(""));
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!email) return;
    void sendVerificationEmail(email)
      .then(() => toast.success("Verification code sent to your email."))
      .catch((err: unknown) => toast.error(getErrorMessage(err)));
  }, [email]);

  const sendCode = async () => {
    if (!email) return;
    setSending(true);
    try {
      await sendVerificationEmail(email);
      toast.success("Verification code sent to your email.");
    } catch (err: unknown) {
      toast.error(getErrorMessage(err));
    } finally {
      setSending(false);
    }
  };

  const handleSubmit = async () => {
    const code = otp.join("");
    if (code.length < OTP_LENGTH) {
      setError("Enter the complete 6-digit code");
      toast.error("Enter the complete 6-digit code");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await verifyEmail(email, code);
      toast.success("Email verified! You can now sign in.");
      navigate("/login");
    } catch (err: unknown) {
      const msg = getErrorMessage(err);
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <AuthCard>
        <AuthHeader
          title="Verify your email"
          subtitle={email ? `We sent a 6-digit code to ${email}` : "Enter the 6-digit code sent to your email"}
        />

        <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
          {error && (
            <Alert severity="error" sx={{ borderRadius: "8px" }}>
              {error}
            </Alert>
          )}

          <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
            <Typography variant="body2" sx={{ fontWeight: 600, color: "#475569", fontSize: "14px" }}>
              6-digit code
            </Typography>
            <OtpInput value={otp} onChange={setOtp} disabled={loading} error={!!error} />
          </Box>

          <PrimaryButton onClick={handleSubmit} loading={loading}>
            Verify Email
          </PrimaryButton>

          <SecondaryButton onClick={sendCode} disabled={sending || loading}>
            {sending ? "Sending…" : "Resend Code"}
          </SecondaryButton>
        </Box>

        <AuthFooter prompt="Wrong email?" actionLabel="Go back" actionTo="/register" />
      </AuthCard>
    </AuthLayout>
  );
}
