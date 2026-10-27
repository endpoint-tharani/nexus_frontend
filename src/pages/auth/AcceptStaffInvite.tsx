import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Box, Alert } from "@mui/material";
import { useNavigate, useSearchParams } from "react-router-dom";
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
import { acceptStaffInvite } from "../../api/auth.api";
import { useAuthStore } from "../../store/auth.store";
import { getApiErrorMessage, getErrorMessage } from "../../utils/errorHandler";

const schema = z
  .object({
    name: z.string().trim().max(80, "Name is too long").optional().or(z.literal("")),
    password: z
      .string()
      .min(8, "Must be at least 8 characters")
      .regex(/[A-Z]/, "Must contain an uppercase letter")
      .regex(/[0-9]/, "Must contain a number"),
    confirmPassword: z.string().min(1, "Confirm password is required"),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type FormData = z.infer<typeof schema>;

function inviteErrorMessage(err: unknown): string {
  const raw = getApiErrorMessage(err).toLowerCase();
  if (raw.includes("expire")) {
    return "This invitation link has expired. Ask your company owner to send a new one.";
  }
  if (raw.includes("already") || raw.includes("accepted")) {
    return "This invitation has already been accepted. Please sign in instead.";
  }
  if (raw.includes("invalid") || raw.includes("not found")) {
    return "This invitation link is invalid. Ask your company owner to resend it.";
  }
  return getErrorMessage(err);
}

export default function AcceptStaffInvite() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", password: "", confirmPassword: "" },
  });

  if (!token) {
    return (
      <AuthLayout>
        <AuthCard>
          <AuthHeader title="Invalid invitation" subtitle="This invitation link is missing or malformed." />
          <Alert severity="error" sx={{ mb: 2, borderRadius: "8px" }}>
            We couldn't find an invitation token in this link. Please use the most recent link from your invitation email.
          </Alert>
          <PrimaryButton onClick={() => navigate("/login")}>
            Go to sign in
          </PrimaryButton>
        </AuthCard>
      </AuthLayout>
    );
  }

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    setError(null);
    try {
      const res = await acceptStaffInvite({
        token,
        password: data.password,
        name: data.name?.trim() || undefined,
      });
      const { user, accessToken, refreshToken } = res.data.data;

      setAuth(user, accessToken, refreshToken);
      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("refreshToken", refreshToken);

      toast.success("Welcome to the team!");
      navigate("/dashboard", { replace: true });
    } catch (err: unknown) {
      const msg = inviteErrorMessage(err);
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
          title="Accept invitation"
          subtitle="Set a password to activate your account and join the workspace."
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
            label="Full name (optional)"
            autoComplete="name"
            disabled={loading}
            {...register("name")}
            error={!!errors.name}
            helperText={errors.name?.message}
          />

          <PasswordField
            label="Password"
            autoComplete="new-password"
            disabled={loading}
            {...register("password")}
            error={!!errors.password}
            helperText={errors.password?.message}
          />

          <PasswordField
            label="Confirm password"
            autoComplete="new-password"
            disabled={loading}
            {...register("confirmPassword")}
            error={!!errors.confirmPassword}
            helperText={errors.confirmPassword?.message}
          />

          <PrimaryButton loading={loading}>Accept invitation</PrimaryButton>
        </Box>

        <AuthFooter prompt="Already have an account?" actionLabel="Sign in" actionTo="/login" />
      </AuthCard>
    </AuthLayout>
  );
}
