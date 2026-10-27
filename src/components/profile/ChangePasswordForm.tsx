import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Box,
  Button,
  CircularProgress,
  IconButton,
  InputAdornment,
  TextField,
} from "@mui/material";
import { MdVisibility, MdVisibilityOff } from "react-icons/md";
import toast from "react-hot-toast";

import { changePasswordSchema } from "../../schemas/user.schema";
import type { ChangePasswordFormData } from "../../schemas/user.schema";
import { useChangePassword } from "../../hooks/user";
import { getErrorMessage } from "../../utils/errorHandler";

type PwField = "currentPassword" | "newPassword" | "confirmPassword";

// Self-contained change-password form. Owns the mutation + toasts and resets on
// success. `changePasswordSchema` is all strings (no coerce) so no Resolver cast.
export default function ChangePasswordForm() {
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
    formState: { errors, isDirty },
  } = useForm<ChangePasswordFormData>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const visibilityAdornment = (field: PwField, label: string) => ({
    endAdornment: (
      <InputAdornment position="end">
        <IconButton
          aria-label={visible[field] ? `Hide ${label}` : `Show ${label}`}
          onClick={() => toggle(field)}
          edge="end"
          disabled={loading}
        >
          {visible[field] ? (
            <MdVisibilityOff size={20} />
          ) : (
            <MdVisibility size={20} />
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
          toast.success("Password changed successfully");
          reset();
        },
        onError: (error) => toast.error(getErrorMessage(error)),
      }
    );
  };

  return (
    <Box
      component="form"
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1, maxWidth: 460 }}
    >
      <TextField
        label="Current Password"
        type={visible.currentPassword ? "text" : "password"}
        fullWidth
        autoComplete="current-password"
        disabled={loading}
        {...register("currentPassword")}
        error={!!errors.currentPassword}
        helperText={errors.currentPassword?.message ?? " "}
        slotProps={{
          input: visibilityAdornment("currentPassword", "current password"),
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
        helperText={errors.newPassword?.message ?? "At least 8 characters"}
        slotProps={{
          input: visibilityAdornment("newPassword", "new password"),
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
        helperText={errors.confirmPassword?.message ?? " "}
        slotProps={{
          input: visibilityAdornment("confirmPassword", "password confirmation"),
        }}
      />

      <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
        <Button
          type="submit"
          variant="contained"
          disabled={loading || !isDirty}
          sx={{ minWidth: 190 }}
        >
          {loading ? (
            <CircularProgress size={20} color="inherit" />
          ) : (
            "Update Password"
          )}
        </Button>
      </Box>
    </Box>
  );
}
