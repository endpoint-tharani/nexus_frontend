import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Box,
  Button,
  CircularProgress,
  Collapse,
  IconButton,
  InputAdornment,
  TextField,
  Paper,
  Typography,
} from "@mui/material";
import VisibilityOutlined from "@mui/icons-material/VisibilityOutlined";
import VisibilityOffOutlined from "@mui/icons-material/VisibilityOffOutlined";
import LockOutlined from "@mui/icons-material/LockOutlined";
import CheckCircleOutlined from "@mui/icons-material/CheckCircleOutlined";
import RadioButtonUnchecked from "@mui/icons-material/RadioButtonUnchecked";
import LockResetOutlined from "@mui/icons-material/LockResetOutlined";
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
  const [editing, setEditing] = useState(false);

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
          setVisible({
            currentPassword: false,
            newPassword: false,
            confirmPassword: false,
          });
          setEditing(false);
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
      title="Password"
      subtitle="Keep your account secure by using a password only you know."
      actions={
        !editing ? (
          <Button
            variant="outlined"
            startIcon={<LockResetOutlined />}
            onClick={() => setEditing(true)}
            sx={{ textTransform: "none", fontWeight: 600, whiteSpace: "nowrap" }}
          >
            Change password
          </Button>
        ) : undefined
      }
      sx={{ maxWidth: 640, borderRadius: 3 }}
    >
      {!editing && (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Box
            sx={{
              display: "flex",
              p: 1,
              borderRadius: 2,
              color: "text.secondary",
              bgcolor: "action.hover",
            }}
          >
            <LockOutlined />
          </Box>
          <Typography variant="body2" color="text.secondary">
            Your password is private. Change it whenever you need to.
          </Typography>
        </Box>
      )}
      <Collapse in={editing} unmountOnExit>
        <Box
          component="form"
          onSubmit={handleSubmit(onSubmit)}
          noValidate
          sx={{ display: "flex", flexDirection: "column", gap: 2, maxWidth: 520 }}
        >
        <TextField
          label="Current password"
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
        />

        <TextField
          label="New password"
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
        />

        <TextField
          label="Confirm new password"
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
            <Typography variant="caption" sx={{ display: "block", fontWeight: 600, mb: 1 }}>
              Your new password must include:
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

        <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1, mt: 0.5 }}>
          <Button
            type="button"
            disabled={loading}
            onClick={() => {
              reset();
              setVisible({
                currentPassword: false,
                newPassword: false,
                confirmPassword: false,
              });
              setEditing(false);
            }}
            sx={{ textTransform: "none" }}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={loading || !isDirty}
            sx={{ textTransform: "none", fontWeight: 600, minWidth: 150 }}
          >
            {loading ? <CircularProgress size={20} color="inherit" /> : "Update password"}
          </Button>
        </Box>
        </Box>
      </Collapse>
    </SectionCard>
  );
}
