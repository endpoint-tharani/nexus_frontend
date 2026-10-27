import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Box, Button, CircularProgress, TextField } from "@mui/material";
import toast from "react-hot-toast";

import { profileSchema } from "../../schemas/user.schema";
import type { ProfileFormData } from "../../schemas/user.schema";
import { useUpdateProfile } from "../../hooks/user";
import { useAuthStore } from "../../store/auth.store";
import { getErrorMessage } from "../../utils/errorHandler";
import { COMPANY_ROLE_LABELS } from "../../constants/enums";
import type { User } from "../../types";

export interface ProfileFormProps {
  user: User;
}

// Self-contained profile editor. The only editable field is `name`; email, role
// and company are shown read-only. Owns the update mutation + toasts and keeps
// the auth store in sync so the sidebar reflects a renamed user immediately.
// `profileSchema` has no `z.coerce`, so no Resolver cast is needed.
export default function ProfileForm({ user }: ProfileFormProps) {
  const updateMutation = useUpdateProfile();
  const setUser = useAuthStore((s) => s.setUser);
  const loading = updateMutation.isPending;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: { name: user.name ?? "" },
  });

  // Re-sync when the loaded user changes (e.g. after /user/me resolves).
  useEffect(() => {
    reset({ name: user.name ?? "" });
  }, [user.name, reset]);

  const roleLabel = user.role ? COMPANY_ROLE_LABELS[user.role] : "—";
  const companyName = user.company?.name ?? "—";

  const onSubmit = (values: ProfileFormData) => {
    updateMutation.mutate(
      { name: values.name.trim() },
      {
        onSuccess: (updated) => {
          toast.success("Profile updated");
          setUser({ name: updated.name });
          reset({ name: updated.name }); // clear the dirty state
        },
        onError: (error) => toast.error(getErrorMessage(error)),
      }
    );
  };

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
          gap: 2,
          mt: 0.5,
        }}
      >
        <Box sx={{ gridColumn: { xs: "auto", sm: "1 / -1" } }}>
          <TextField
            label="Full Name"
            required
            fullWidth
            autoFocus
            disabled={loading}
            {...register("name")}
            error={!!errors.name}
            helperText={errors.name?.message ?? " "}
          />
        </Box>

        <TextField
          label="Email"
          fullWidth
          value={user.email ?? ""}
          disabled
          helperText="Email address can't be changed"
        />

        <TextField
          label="Role"
          fullWidth
          value={roleLabel}
          disabled
        />

        <Box sx={{ gridColumn: { xs: "auto", sm: "1 / -1" } }}>
          <TextField
            label="Company"
            fullWidth
            value={companyName}
            disabled
          />
        </Box>
      </Box>

      <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 1 }}>
        <Button
          type="submit"
          variant="contained"
          aria-busy={loading}
          disabled={loading || !isDirty}
          sx={{ minWidth: 170 }}
        >
          {loading ? (
            <CircularProgress size={20} color="inherit" aria-label="Saving" />
          ) : (
            "Save Changes"
          )}
        </Button>
      </Box>
    </Box>
  );
}
