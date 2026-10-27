import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Box, Typography, InputAdornment } from "@mui/material";
import MailOutlined from "@mui/icons-material/MailOutlined";
import CheckCircleOutlined from "@mui/icons-material/CheckCircleOutlined";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import {
  AuthLayout,
  AuthCard,
  AuthHeader,
  AuthTextField,
  PrimaryButton,
  SecondaryButton,
  AuthFooter,
} from "../../components/auth";
import { forgotPassword } from "../../api/auth.api";
import { getErrorMessage } from "../../utils/errorHandler";

const schema = z.object({
  email: z.string().email("Enter a valid email"),
});

type FormData = z.infer<typeof schema>;

export default function ForgotPassword() {
  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState("");
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema), defaultValues: { email: "" } });

  const onSubmit = async ({ email }: FormData) => {
    setLoading(true);
    try {
      await forgotPassword(email);
      setSubmittedEmail(email);
      setIsSuccess(true);
      toast.success("Reset code sent! Check your inbox.");
    } catch (err: unknown) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <AuthCard>
        {isSuccess ? (
          // Success State — Green confirmation
          <Box sx={{ display: "flex", flexDirection: "column", gap: 3, textAlign: "center", py: 2 }}>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: 56,
                height: 56,
                borderRadius: "50%",
                bgcolor: "rgba(22, 163, 74, 0.1)",
                color: "#16A34A",
                mx: "auto",
              }}
            >
              <CheckCircleOutlined sx={{ fontSize: 32 }} />
            </Box>

            <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
              <Typography
                variant="h2"
                component="h1"
                sx={{
                  fontWeight: 700,
                  fontSize: "24px",
                  color: "#111827",
                  letterSpacing: "-0.01em",
                }}
              >
                Reset link sent
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  color: "#6B7280",
                  fontSize: "15px",
                  lineHeight: "22px",
                }}
              >
                We have sent a verification code to <strong>{submittedEmail}</strong>. Please enter the code to update your password.
              </Typography>
            </Box>

            <PrimaryButton
              onClick={() => navigate(`/reset-password?email=${encodeURIComponent(submittedEmail)}`)}
            >
              Enter Verification Code
            </PrimaryButton>

            <SecondaryButton onClick={() => navigate("/login")}>
              Back to Password Login
            </SecondaryButton>
          </Box>
        ) : (
          // Initial Form State
          <>
            <AuthHeader title="Forgot Password" subtitle="Enter your registered email." />

            <Box
              component="form"
              onSubmit={handleSubmit(onSubmit)}
              noValidate
              sx={{ display: "flex", flexDirection: "column", gap: 3 }}
            >
              <AuthTextField
                label="Email address"
                type="email"
                autoComplete="email"
                {...register("email")}
                error={!!errors.email}
                helperText={errors.email?.message}
                disabled={loading}
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start" sx={{ pl: 0.5, pr: 0.5 }}>
                        <MailOutlined sx={{ fontSize: 20, color: "#6B7280" }} />
                      </InputAdornment>
                    ),
                  },
                }}
              />

              <PrimaryButton loading={loading}>Send Reset Link</PrimaryButton>
            </Box>

            <AuthFooter
              prompt="Remembered it?"
              actionLabel="Sign in"
              actionTo="/login"
            />
          </>
        )}
      </AuthCard>
    </AuthLayout>
  );
}
