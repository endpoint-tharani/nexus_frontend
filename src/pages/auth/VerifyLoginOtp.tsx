import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Box, Alert, Typography, Button } from "@mui/material";
import toast from "react-hot-toast";

import {
  AuthLayout,
  AuthCard,
  AuthHeader,
  OtpInput,
  PrimaryButton,
  AuthFooter,
} from "../../components/auth";
import { requestLoginOtp, verifyLoginOtp } from "../../api/auth.api";
import { useAuthStore } from "../../store/auth.store";
import { setTokens } from "../../api/axios";
import { toastErrorMessage } from "../../utils/apiError";

const OTP_LENGTH = 6;

export default function VerifyLoginOtp() {
  const [searchParams] = useSearchParams();
  const email = searchParams.get("email") ?? "";
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);

  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(""));
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(60);

  // Countdown timer effect
  useEffect(() => {
    if (countdown === 0) return;
    const interval = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [countdown]);

  // No email in the link — send the user back to request a fresh code.
  if (!email) {
    return (
      <AuthLayout>
        <AuthCard>
          <AuthHeader title="Start again" subtitle="We couldn't tell which account to verify." />
          <Alert severity="error" sx={{ mb: 2, borderRadius: "8px" }}>
            This verification link is missing an email address. Please request a new login code.
          </Alert>
          <PrimaryButton onClick={() => navigate("/login-otp")}>
            Request a login code
          </PrimaryButton>
        </AuthCard>
      </AuthLayout>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = otp.join("");
    if (code.length < OTP_LENGTH) {
      setError("Enter the complete 6-digit code");
      toast.error("Enter the complete 6-digit code");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await verifyLoginOtp(email, code);
      const { user, accessToken, refreshToken } = res.data.data;

      setAuth(user, accessToken, refreshToken);
      setTokens(accessToken, refreshToken);

      toast.success("Welcome back!");
      navigate("/dashboard", { replace: true });
    } catch (err: unknown) {
      const msg = toastErrorMessage(err);
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (countdown > 0) return;
    setResending(true);
    setError(null);
    try {
      await requestLoginOtp(email);
      toast.success("A new code is on its way.");
      setCountdown(60); // Reset countdown to 60 seconds
    } catch (err: unknown) {
      toast.error(toastErrorMessage(err));
    } finally {
      setResending(false);
    }
  };

  return (
    <AuthLayout>
      <AuthCard>
        <AuthHeader
          title="Sign in with Login Code"
          subtitle={`We sent a 6-digit login code to ${email}.`}
        />

        <Box
          component="form"
          onSubmit={handleSubmit}
          noValidate
          sx={{ display: "flex", flexDirection: "column", gap: 3 }}
        >
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

          <PrimaryButton loading={loading}>Verify and sign in</PrimaryButton>

          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", mt: -0.5 }}>
            {countdown > 0 ? (
              <Typography variant="body2" sx={{ color: "#6B7280", fontWeight: 500 }}>
                Resend code in {countdown}s
              </Typography>
            ) : (
              <Button
                type="button"
                variant="text"
                onClick={handleResend}
                disabled={resending || loading}
                sx={{
                  fontWeight: 600,
                  color: "#2563EB",
                  "&:hover": { bgcolor: "transparent", color: "#1D4ED8" },
                }}
              >
                {resending ? "Sending…" : "Resend code"}
              </Button>
            )}
          </Box>
        </Box>

        <AuthFooter
          prompt="Prefer a password?"
          actionLabel="Sign in with password"
          actionTo="/login"
        />
      </AuthCard>
    </AuthLayout>
  );
}
