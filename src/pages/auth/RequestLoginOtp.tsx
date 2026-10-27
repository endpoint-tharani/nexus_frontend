import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Box, Alert, InputAdornment } from "@mui/material";
import MailOutlined from "@mui/icons-material/MailOutlined";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import {
  AuthLayout,
  AuthCard,
  AuthHeader,
  AuthTextField,
  PrimaryButton,
  AuthFooter,
} from "../../components/auth";
import { requestLoginOtp } from "../../api/auth.api";
import { toastErrorMessage } from "../../utils/apiError";

const schema = z.object({
  email: z.string().email("Enter a valid email"),
});

type FormData = z.infer<typeof schema>;

export default function RequestLoginOtp() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { email: "" },
  });

  const onSubmit = async ({ email }: FormData) => {
    setLoading(true);
    setError(null);
    try {
      await requestLoginOtp(email);
      toast.success("Login code sent! Check your inbox.");
      navigate(`/verify-login-otp?email=${encodeURIComponent(email)}`);
    } catch (err: unknown) {
      const msg = toastErrorMessage(err);
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
          title="Sign in with Login Code"
          subtitle="Enter your email and we'll send you a one-time login code."
        />

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
            autoFocus
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

          <PrimaryButton loading={loading}>Send Code</PrimaryButton>
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
