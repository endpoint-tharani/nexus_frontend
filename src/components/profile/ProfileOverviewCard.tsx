import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Box,
  Button,
  CircularProgress,
  Divider,
  Grid,
  InputAdornment,
  Paper,
  TextField,
  Typography,
} from "@mui/material";
import EditOutlined from "@mui/icons-material/EditOutlined";
import PersonOutlined from "@mui/icons-material/PersonOutlined";
import SaveOutlined from "@mui/icons-material/SaveOutlined";
import toast from "react-hot-toast";

import { SectionCard } from "../ui";
import { profileSchema } from "../../schemas/user.schema";
import type { ProfileFormData } from "../../schemas/user.schema";
import { useUpdateProfile } from "../../hooks/user";
import { useAuthStore } from "../../store/auth.store";
import { getErrorMessage } from "../../utils/errorHandler";
import { COMPANY_ROLE_LABELS } from "../../constants/enums";
import { formatDate } from "../../utils/format";
import type { User } from "../../types";

interface ProfileOverviewCardProps {
  user: User;
}

export default function ProfileOverviewCard({ user }: ProfileOverviewCardProps) {
  const updateMutation = useUpdateProfile();
  const setUser = useAuthStore((s) => s.setUser);
  const loading = updateMutation.isPending;
  const [editing, setEditing] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: { name: user.name ?? "" },
  });

  useEffect(() => {
    reset({ name: user.name ?? "" });
  }, [user.name, reset]);

  const onSubmit = (values: ProfileFormData) => {
    updateMutation.mutate(
      { name: values.name.trim() },
      {
        onSuccess: (updated) => {
          toast.success("Profile details updated successfully");
          setUser({ name: updated.name });
          reset({ name: updated.name });
          setEditing(false);
        },
        onError: (error) => toast.error(getErrorMessage(error)),
      }
    );
  };

  const roleLabel = user.role ? COMPANY_ROLE_LABELS[user.role] : "Employee";
  const companyName = user.company?.name ?? "Auronox Workforce";

  return (
    <SectionCard
      title="Your profile"
      subtitle="Your profile and workspace information at a glance."
      sx={{ maxWidth: 880, borderRadius: 3 }}
    >
      <Box
        component="form"
        onSubmit={handleSubmit(onSubmit)}
        noValidate
        sx={{ maxWidth: 560 }}
      >
        {editing ? (
          <>
            <TextField
              label="Name"
              required
              fullWidth
              autoComplete="name"
              autoFocus
              disabled={loading}
              {...register("name")}
              error={!!errors.name}
              helperText={errors.name?.message ?? "This is the name people in your workspace will see."}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <PersonOutlined color="action" />
                    </InputAdornment>
                  ),
                },
              }}
            />
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: { xs: "stretch", sm: "center" },
                flexDirection: { xs: "column", sm: "row" },
                gap: 1.5,
                mt: 1.5,
              }}
            >
              <Typography variant="body2" color="text.secondary">
                {isDirty ? "Remember to save your change." : "Make your changes, then save."}
              </Typography>
              <Box sx={{ display: "flex", gap: 1, justifyContent: "flex-end" }}>
                <Button
                  type="button"
                  disabled={loading}
                  onClick={() => {
                    reset({ name: user.name ?? "" });
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
                  startIcon={!loading && <SaveOutlined />}
                  sx={{ textTransform: "none", fontWeight: 600, minWidth: 144 }}
                >
                  {loading ? <CircularProgress size={20} color="inherit" /> : "Save name"}
                </Button>
              </Box>
            </Box>
          </>
        ) : (
          <Paper
            variant="outlined"
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 2,
              minHeight: 76,
              p: 1.75,
              borderRadius: 2,
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, minWidth: 0 }}>
              <Box
                sx={{
                  display: "flex",
                  p: 1,
                  borderRadius: 2,
                  color: "primary.main",
                  bgcolor: "action.hover",
                }}
              >
                <PersonOutlined />
              </Box>
              <Box sx={{ minWidth: 0 }}>
                <Typography variant="caption" color="text.secondary">
                  Name
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 600, overflowWrap: "anywhere" }}>
                  {user.name || "Name not provided"}
                </Typography>
              </Box>
            </Box>
            <Button
              type="button"
              variant="outlined"
              startIcon={<EditOutlined />}
              onClick={() => setEditing(true)}
              sx={{ flexShrink: 0, textTransform: "none", fontWeight: 600 }}
            >
              Edit
            </Button>
          </Paper>
        )}
      </Box>

      <Divider sx={{ my: 3 }} />

      <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 700 }}>
        Account details
      </Typography>
      <Grid container spacing={1.5}>
        <Grid size={{ xs: 12, sm: 6 }}>
          <ReadOnlyDetail label="Email address" value={user.email || "Not provided"} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <ReadOnlyDetail label="Organization" value={companyName} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <ReadOnlyDetail label="Role" value={roleLabel} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <ReadOnlyDetail label="Member since" value={formatDate(user.createdAt)} />
        </Grid>
      </Grid>
    </SectionCard>
  );
}

interface ReadOnlyDetailProps {
  label: string;
  value: string;
}

function ReadOnlyDetail({ label, value }: ReadOnlyDetailProps) {
  return (
    <Paper
      variant="outlined"
      sx={{
        minHeight: 68,
        px: 1.75,
        py: 1.25,
        borderRadius: 2,
      }}
    >
      <Box sx={{ minWidth: 0 }}>
        <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 0.25 }}>
          {label}
        </Typography>
        <Typography variant="body2" sx={{ fontWeight: 600, overflowWrap: "anywhere" }}>
          {value}
        </Typography>
      </Box>
    </Paper>
  );
}
