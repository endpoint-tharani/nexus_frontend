import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Box, Typography, Paper } from "@mui/material";
import CheckCircleOutlined from "@mui/icons-material/CheckCircleOutlined";
import RadioButtonUnchecked from "@mui/icons-material/RadioButtonUnchecked";
import { useNavigate, useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";

import {
  AuthLayout,
  AuthCard,
  AuthHeader,
  PasswordField,
  OtpInput,
  PrimaryButton,
  AuthFooter,
} from "../../components/auth";
import { resetPassword } from "../../api/auth.api";
import { getErrorMessage } from "../../utils/errorHandler";

const OTP_LENGTH = 6;

const schema = z
  .object({
    newPassword: z
      .string()
      .min(8, "Must be at least 8 characters")
      .regex(/[A-Z]/, "Must contain an uppercase letter")
      .regex(/[0-9]/, "Must contain a number"),
    confirmPassword: z.string().min(1, "Confirm password is required"),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type FormData = z.infer<typeof schema>;

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const email = searchParams.get("email") || "";
  const navigate = useNavigate();

  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(""));
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { newPassword: "", confirmPassword: "" },
  });

  const newPassword = watch("newPassword") || "";

  const onSubmit = async (data: FormData) => {
    const code = otp.join("");
    if (code.length < OTP_LENGTH) {
      toast.error("Enter the complete 6-digit code");
      return;
    }
    setLoading(true);
    try {
      await resetPassword(email, code, data.newPassword);
      toast.success("Password reset! Sign in with your new password.");
      navigate("/login");
    } catch (err: unknown) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  // Password checklist rules based on requirements
  const rules = [
    { ok: newPassword.length >= 8, label: "8 characters" },
    { ok: /[A-Z]/.test(newPassword), label: "Uppercase letter" },
    { ok: /[a-z]/.test(newPassword), label: "Lowercase letter" },
    { ok: /[0-9]/.test(newPassword), label: "Number" },
    { ok: /[^A-Za-z0-9]/.test(newPassword), label: "Special character" },
  ];

  return (
    <AuthLayout>
      <AuthCard>
        <AuthHeader
          title="Set a new password"
          subtitle={email ? `Enter the code sent to ${email} and choose a new password.` : "Enter the verification code and set a new password."}
        />

        <Box
          component="form"
          onSubmit={handleSubmit(onSubmit)}
          noValidate
          sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}
        >
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
            <Typography variant="body2" sx={{ fontWeight: 600, color: "#475569", fontSize: "14px" }}>
              Verification code
            </Typography>
            <OtpInput value={otp} onChange={setOtp} disabled={loading} />
          </Box>

          <PasswordField
            label="New Password"
            autoComplete="new-password"
            {...register("newPassword")}
            error={!!errors.newPassword}
            helperText={errors.newPassword?.message}
            disabled={loading}
          />

          <PasswordField
            label="Confirm Password"
            autoComplete="new-password"
            {...register("confirmPassword")}
            error={!!errors.confirmPassword}
            helperText={errors.confirmPassword?.message}
            disabled={loading}
          />

          {newPassword.length > 0 && (
            <Paper
              variant="outlined"
              sx={{
                p: 2,
                borderRadius: "8px",
                borderColor: "#E5E7EB",
                bgcolor: "#F8FAFC",
              }}
            >
              <Typography
                variant="caption"
                sx={{
                  display: "block",
                  fontWeight: 600,
                  color: "#475569",
                  mb: 1,
                  fontSize: "12px",
                }}
              >
                Password requirements:
              </Typography>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                {rules.map((rule, idx) => (
                  <Box key={idx} sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    {rule.ok ? (
                      <CheckCircleOutlined sx={{ fontSize: 16, color: "#16A34A" }} />
                    ) : (
                      <RadioButtonUnchecked sx={{ fontSize: 16, color: "#94A3B8" }} />
                    )}
                    <Typography
                      variant="caption"
                      sx={{
                        fontSize: "13px",
                        fontWeight: 500,
                        color: rule.ok ? "#16A34A" : "#6B7280",
                      }}
                    >
                      {rule.label}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </Paper>
          )}

          <PrimaryButton loading={loading}>Update Password</PrimaryButton>
        </Box>

        <AuthFooter prompt="Know your password?" actionLabel="Sign in" actionTo="/login" />
      </AuthCard>
    </AuthLayout>
  );
}
