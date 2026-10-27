import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Box, Alert, Link, FormControlLabel, Checkbox, InputAdornment } from "@mui/material";
import MailOutlined from "@mui/icons-material/MailOutlined";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import {
  AuthLayout,
  AuthCard,
  AuthHeader,
  AuthTextField,
  PasswordField,
  PrimaryButton,
  SecondaryButton,
  FormDivider,
  AuthFooter,
} from "../../components/auth";
import { login } from "../../api/auth.api";
import { useAuthStore } from "../../store/auth.store";
import { useModuleStore } from "../../store/module.store";
import { parseModules } from "../../constants/modules";
import { getApiErrorMessage } from "../../utils/errorHandler";

const schema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
  rememberMe: z.boolean().optional(),
});

type FormData = z.infer<typeof schema>;

export default function Login() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);
  const setEnabledModules = useModuleStore((s) => s.setEnabledModules);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { email: "", password: "", rememberMe: false },
  });

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    setError(null);

    try {
      const res = await login({ email: data.email, password: data.password });
      const { user, accessToken, refreshToken, enabledModules } = res.data.data;

      setAuth({ ...user, role: user.role ?? user.userRole }, accessToken, refreshToken);
      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("refreshToken", refreshToken);

      const modules = parseModules(enabledModules ?? user.enabledModules);
      if (modules.length) setEnabledModules(modules);

      toast.success("Welcome back!");
      navigate("/dashboard");
    } catch (err: unknown) {
      const raw = getApiErrorMessage(err);

      if (raw === "Email not verified") {
        toast.error("Email not verified. Redirecting to verification.");
        navigate(`/verify-email?email=${encodeURIComponent(data.email)}`);
      } else {
        const msg = raw || "Login failed. Try again.";
        setError(msg);
        toast.error(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <AuthCard>
        <AuthHeader title="Welcome back" subtitle="Sign in to your workspace." />

        <Box
          component="form"
          onSubmit={handleSubmit(onSubmit)}
          noValidate
          sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}
        >
          {error && (
            <Alert severity="error" sx={{ borderRadius: "8px" }}>
              {error}
            </Alert>
          )}

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

          <PasswordField
            label="Password"
            autoComplete="current-password"
            {...register("password")}
            error={!!errors.password}
            helperText={errors.password?.message}
            disabled={loading}
          />

          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              mt: -0.5,
            }}
          >
            <FormControlLabel
              control={
                <Checkbox
                  size="small"
                  {...register("rememberMe")}
                  disabled={loading}
                />
              }
              label="Remember me"
              sx={{
                "& .MuiFormControlLabel-label": {
                  fontSize: "14px",
                  fontWeight: 500,
                  color: "#475569",
                  userSelect: "none",
                },
              }}
            />
            <Link
              component={RouterLink}
              to="/forgot-password"
              variant="body2"
              underline="hover"
              sx={{
                fontWeight: 600,
                fontSize: "14px",
                color: "#2563EB",
                "&:hover": { color: "#1D4ED8" },
              }}
            >
              Forgot Password?
            </Link>
          </Box>

          <PrimaryButton loading={loading}>Sign In</PrimaryButton>

          <FormDivider />

          <SecondaryButton
            onClick={() => navigate("/login-otp")}
            disabled={loading}
          >
            Sign in with Login Code
          </SecondaryButton>
        </Box>

        <AuthFooter
          prompt="Don't have an account?"
          actionLabel="Create account"
          actionTo="/register"
        />
      </AuthCard>
    </AuthLayout>
  );
}
