import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Box, Alert, FormControlLabel, Checkbox, Paper, Typography, InputAdornment } from "@mui/material";
import MailOutlined from "@mui/icons-material/MailOutlined";
import CheckCircleOutlined from "@mui/icons-material/CheckCircleOutlined";
import RadioButtonUnchecked from "@mui/icons-material/RadioButtonUnchecked";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import {
  AuthLayout,
  AuthCard,
  AuthHeader,
  AuthTextField,
  PasswordField,
  PrimaryButton,
  AuthFooter,
} from "../../components/auth";
import { signup } from "../../api/auth.api";
import { getApiErrorMessage } from "../../utils/errorHandler";

const schema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    companyName: z.string().min(1, "Company name is required"),
    email: z.string().email("Enter a valid email"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Must contain an uppercase letter")
      .regex(/[0-9]/, "Must contain a number"),
    confirmPassword: z.string().min(1, "Confirm password is required"),
    acceptTerms: z.boolean().refine((val) => val === true, "You must accept the terms and conditions"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type FormData = z.infer<typeof schema>;
type FieldName = keyof FormData;

const getFieldFromError = (message: string): FieldName | null => {
  const lower = message.toLowerCase();
  if (lower.includes("email") || lower.includes("already exists") || lower.includes("already in use")) {
    return "email";
  }
  if (lower.includes("password")) return "password";
  if (lower.includes("name") || lower.includes("username")) return "name";
  return null;
};

export default function Register() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setError: setFormError,
    clearErrors,
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", companyName: "", email: "", password: "", confirmPassword: "", acceptTerms: false },
  });

  const password = watch("password") || "";

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    setError(null);
    clearErrors();

    try {
      // Pass the name, email, and password to the signup API. 
      // The API expects SignupPayload: { name, email, password }
      await signup({
        name: data.name,
        email: data.email,
        password: data.password,
      });
      if (data.companyName) {
        localStorage.setItem("pendingCompanyName", data.companyName);
      }
      toast.success("Account created! Check your email to verify.");
      navigate(`/verify-email?email=${encodeURIComponent(data.email)}`);
    } catch (err: unknown) {
      const message = getApiErrorMessage(err) || "Registration failed. Please try again.";
      setError(message);
      toast.error(message);

      const field = getFieldFromError(message);
      if (field) setFormError(field, { type: "manual", message });
    } finally {
      setLoading(false);
    }
  };

  // Password checklist rules based on requirements
  const rules = [
    { ok: password.length >= 8, label: "8 characters" },
    { ok: /[A-Z]/.test(password), label: "Uppercase letter" },
    { ok: /[a-z]/.test(password), label: "Lowercase letter" },
    { ok: /[0-9]/.test(password), label: "Number" },
    { ok: /[^A-Za-z0-9]/.test(password), label: "Special character" },
  ];

  return (
    <AuthLayout>
      <AuthCard>
        <AuthHeader title="Create workspace" subtitle="Set up your organization and its structure." />

        <Box
          component="form"
          onSubmit={handleSubmit(onSubmit)}
          noValidate
          sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}
        >
          {error && (
            <Alert severity="error" sx={{ borderRadius: "8px" }} onClose={() => setError(null)}>
              {error}
            </Alert>
          )}

          <AuthTextField
            label="Full name"
            autoComplete="name"
            {...register("name")}
            error={!!errors.name}
            helperText={errors.name?.message}
            disabled={loading}
          />

          <AuthTextField
            label="Company name"
            autoComplete="organization"
            {...register("companyName")}
            error={!!errors.companyName}
            helperText={errors.companyName?.message}
            disabled={loading}
          />

          <AuthTextField
            label="Work email"
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

          <PasswordField
            label="Password"
            autoComplete="new-password"
            {...register("password")}
            error={!!errors.password}
            helperText={errors.password?.message}
            disabled={loading}
          />

          <PasswordField
            label="Confirm password"
            autoComplete="new-password"
            {...register("confirmPassword")}
            error={!!errors.confirmPassword}
            helperText={errors.confirmPassword?.message}
            disabled={loading}
          />

          {password.length > 0 && (
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

          <Box sx={{ display: "flex", flexDirection: "column" }}>
            <FormControlLabel
              control={
                <Checkbox
                  size="small"
                  {...register("acceptTerms")}
                  disabled={loading}
                />
              }
              label={
                <Typography variant="body2" sx={{ fontSize: "14px", color: "#475569", fontWeight: 400 }}>
                  I accept the Terms of Service and Privacy Policy
                </Typography>
              }
              sx={{
                alignItems: "flex-start",
                "& .MuiCheckbox-root": {
                  pt: 0.25,
                },
              }}
            />
            {errors.acceptTerms && (
              <Typography
                variant="caption"
                sx={{
                  color: "#DC2626",
                  mt: 0.5,
                  ml: 4.25,
                  fontSize: "13px",
                }}
              >
                {errors.acceptTerms.message}
              </Typography>
            )}
          </Box>

          <PrimaryButton loading={loading}>Create Workspace</PrimaryButton>
        </Box>

        <AuthFooter
          prompt="Already have an account?"
          actionLabel="Sign in"
          actionTo="/login"
        />
      </AuthCard>
    </AuthLayout>
  );
}
