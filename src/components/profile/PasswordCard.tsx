import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Box, Button, CircularProgress, IconButton, InputAdornment, TextField, Paper, Typography } from "@mui/material";
import VisibilityOutlined from "@mui/icons-material/VisibilityOutlined";
import VisibilityOffOutlined from "@mui/icons-material/VisibilityOffOutlined";
import LockOutlined from "@mui/icons-material/LockOutlined";
import CheckCircleOutlined from "@mui/icons-material/CheckCircleOutlined";
import RadioButtonUnchecked from "@mui/icons-material/RadioButtonUnchecked";
import toast from "react-hot-toast";

import { SectionCard } from "../ui";
import { changePasswordSchema } from "../../schemas/user.schema";
import type { ChangePasswordFormData } from "../../schemas/user.schema";
import { useChangePassword } from "../../hooks/user";
import { getErrorMessage } from "../../utils/errorHandler";

type PwField = "currentPassword" | "newPassword" | "confirmPassword";

export default function PasswordCard() {
  const changeMutation = useChangePassword();
  const loading = changeMutation.isPending;

  const [visible, setVisible] = useState<Record<PwField, boolean>>({
    currentPassword: false,
    newPassword: false,
    confirmPassword: false,
  });

  const toggle = (field: PwField) =>
    setVisible((v) => ({ ...v, [field]: !v[field] }));

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isDirty },
  } = useForm<ChangePasswordFormData>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const newPassword = watch("newPassword") || "";

  const visibilityAdornment = (field: PwField, label: string) => ({
    startAdornment: (
      <InputAdornment position="start">
        <LockOutlined sx={{ fontSize: 20, color: "#6B7280" }} />
      </InputAdornment>
    ),
    endAdornment: (
      <InputAdornment position="end">
        <IconButton
          aria-label={visible[field] ? `Hide ${label}` : `Show ${label}`}
          onClick={() => toggle(field)}
          edge="end"
          disabled={loading}
          sx={{
            color: "#6B7280",
            "&:hover": { color: "#111827" },
          }}
        >
          {visible[field] ? (
            <VisibilityOffOutlined sx={{ fontSize: 20 }} />
          ) : (
            <VisibilityOutlined sx={{ fontSize: 20 }} />
          )}
        </IconButton>
      </InputAdornment>
    ),
  });

  const onSubmit = (values: ChangePasswordFormData) => {
    changeMutation.mutate(
      {
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      },
      {
        onSuccess: () => {
          toast.success("Password updated successfully");
          reset();
        },
        onError: (error) => toast.error(getErrorMessage(error)),
      }
    );
  };

  // Password requirements checklist
  const rules = [
    { ok: newPassword.length >= 8, label: "8 characters" },
    { ok: /[A-Z]/.test(newPassword), label: "Uppercase letter" },
    { ok: /[a-z]/.test(newPassword), label: "Lowercase letter" },
    { ok: /[0-9]/.test(newPassword), label: "Number" },
    { ok: /[^A-Za-z0-9]/.test(newPassword), label: "Special character" },
  ];

  return (
    <SectionCard
      title="Password Credentials"
      subtitle="Update your sign-in password regularly to maintain workspace safety."
      sx={{ height: "100%" }}
    >
      <Box
        component="form"
        onSubmit={handleSubmit(onSubmit)}
        noValidate
        sx={{ display: "flex", flexDirection: "column", gap: 2.5, mt: 1 }}
      >
        <TextField
          label="Current Password"
          type={visible.currentPassword ? "text" : "password"}
          fullWidth
          autoComplete="current-password"
          disabled={loading}
          {...register("currentPassword")}
          error={!!errors.currentPassword}
          helperText={errors.currentPassword?.message}
          slotProps={{
            input: visibilityAdornment("currentPassword", "current password"),
          }}
          sx={{
            "& .MuiOutlinedInput-root": {
              height: "52px",
              borderRadius: "10px",
              "& fieldset": { borderColor: "#E5E7EB" },
            },
          }}
        />

        <TextField
          label="New Password"
          type={visible.newPassword ? "text" : "password"}
          fullWidth
          autoComplete="new-password"
          disabled={loading}
          {...register("newPassword")}
          error={!!errors.newPassword}
          helperText={errors.newPassword?.message}
          slotProps={{
            input: visibilityAdornment("newPassword", "new password"),
          }}
          sx={{
            "& .MuiOutlinedInput-root": {
              height: "52px",
              borderRadius: "10px",
              "& fieldset": { borderColor: "#E5E7EB" },
            },
          }}
        />

        <TextField
          label="Confirm New Password"
          type={visible.confirmPassword ? "text" : "password"}
          fullWidth
          autoComplete="new-password"
          disabled={loading}
          {...register("confirmPassword")}
          error={!!errors.confirmPassword}
          helperText={errors.confirmPassword?.message}
          slotProps={{
            input: visibilityAdornment("confirmPassword", "password confirmation"),
          }}
          sx={{
            "& .MuiOutlinedInput-root": {
              height: "52px",
              borderRadius: "10px",
              "& fieldset": { borderColor: "#E5E7EB" },
            },
          }}
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
              Password strength checklist:
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

        <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 1 }}>
          <Button
            type="submit"
            variant="contained"
            disabled={loading || !isDirty}
            sx={{
              height: "44px",
              borderRadius: "8px",
              textTransform: "none",
              fontWeight: 600,
              bgcolor: "#2563EB",
              px: 3,
              boxShadow: "none",
              "&:hover": { bgcolor: "#1D4ED8", boxShadow: "none" },
            }}
          >
            {loading ? <CircularProgress size={20} color="inherit" /> : "Update Password"}
          </Button>
        </Box>
      </Box>
    </SectionCard>
  );
}
