import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Box, Button, CircularProgress, Grid, TextField, InputAdornment } from "@mui/material";
import LockOutlined from "@mui/icons-material/LockOutlined";
import PersonOutlined from "@mui/icons-material/PersonOutlined";
import EmailOutlined from "@mui/icons-material/EmailOutlined";
import BusinessOutlined from "@mui/icons-material/BusinessOutlined";
import CalendarMonthOutlined from "@mui/icons-material/CalendarMonthOutlined";
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
        },
        onError: (error) => toast.error(getErrorMessage(error)),
      }
    );
  };

  const roleLabel = user.role ? COMPANY_ROLE_LABELS[user.role] : "Employee";
  const companyName = user.company?.name ?? "Auronox Workforce";
  
  // Username derived from Email
  const username = user.email.split("@")[0];

  return (
    <Grid container spacing={3}>
      {/* 1. Personal Information (Form Card) */}
      <Grid size={{ xs: 12, md: 6 }}>
        <SectionCard
          title="Personal Information"
          subtitle="Configure your profile identity. Click the field to edit and update your name."
          sx={{ height: "100%" }}
        >
          <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate sx={{ mt: 1 }}>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
              <TextField
                label="Full Name"
                required
                fullWidth
                disabled={loading}
                {...register("name")}
                error={!!errors.name}
                helperText={errors.name?.message}
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <PersonOutlined sx={{ color: "#2563EB" }} />
                      </InputAdornment>
                    ),
                  },
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    height: "52px",
                    borderRadius: "10px",
                    transition: "border-color 0.12s ease-in-out",
                    "& fieldset": { borderColor: "#E5E7EB" },
                    "&:hover fieldset": { borderColor: "#CBD5E1" },
                    "&.Mui-focused fieldset": { borderColor: "#2563EB" },
                  },
                }}
              />
            </Box>

            <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 3 }}>
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
                {loading ? <CircularProgress size={20} color="inherit" /> : "Save Changes"}
              </Button>
            </Box>
          </Box>
        </SectionCard>
      </Grid>

      {/* 2. Account Information (Read-only Card) */}
      <Grid size={{ xs: 12, md: 6 }}>
        <SectionCard
          title="Account Information"
          subtitle="System account settings. Email credentials cannot be changed."
          sx={{ height: "100%" }}
        >
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5, mt: 1 }}>
            <TextField
              label="Email Address"
              fullWidth
              value={user.email}
              disabled
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <EmailOutlined sx={{ color: "#94A3B8" }} />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <LockOutlined sx={{ color: "#94A3B8", fontSize: 16 }} />
                    </InputAdornment>
                  ),
                },
              }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  height: "52px",
                  borderRadius: "10px",
                  bgcolor: "#F8FAFC",
                },
              }}
            />

            <TextField
              label="Username ID"
              fullWidth
              value={username}
              disabled
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <PersonOutlined sx={{ color: "#94A3B8" }} />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <LockOutlined sx={{ color: "#94A3B8", fontSize: 16 }} />
                    </InputAdornment>
                  ),
                },
              }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  height: "52px",
                  borderRadius: "10px",
                  bgcolor: "#F8FAFC",
                },
              }}
            />
          </Box>
        </SectionCard>
      </Grid>

      {/* 3. Organization Information (Read-only Card) */}
      <Grid size={{ xs: 12 }}>
        <SectionCard
          title="Organization Information"
          subtitle="Your official employment profile, configured by HR administrators."
        >
          <Grid container spacing={3} sx={{ mt: 0.5 }}>
            <Grid size={{ xs: 12, md: 4 }}>
              <TextField
                label="Company Name"
                fullWidth
                value={companyName}
                disabled
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <BusinessOutlined sx={{ color: "#94A3B8" }} />
                      </InputAdornment>
                    ),
                  },
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    height: "52px",
                    borderRadius: "10px",
                    bgcolor: "#F8FAFC",
                  },
                }}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
              <TextField
                label="Security Role"
                fullWidth
                value={roleLabel}
                disabled
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <LockOutlined sx={{ color: "#94A3B8" }} />
                      </InputAdornment>
                    ),
                  },
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    height: "52px",
                    borderRadius: "10px",
                    bgcolor: "#F8FAFC",
                  },
                }}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
              <TextField
                label="Joined Workspace Date"
                fullWidth
                value={formatDate(user.createdAt)}
                disabled
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <CalendarMonthOutlined sx={{ color: "#94A3B8" }} />
                      </InputAdornment>
                    ),
                  },
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    height: "52px",
                    borderRadius: "10px",
                    bgcolor: "#F8FAFC",
                  },
                }}
              />
            </Grid>
          </Grid>
        </SectionCard>
      </Grid>
    </Grid>
  );
}
