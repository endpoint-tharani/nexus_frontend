import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { MenuItem, Stack, TextField } from "@mui/material";
import toast from "react-hot-toast";

import { FormDialog } from "../ui";
import { useInviteStaff } from "../../hooks/company";
import { inviteStaffSchema } from "../../schemas/company.schema";
import type { InviteStaffFormData } from "../../schemas/company.schema";
import { CompanyRole, INVITABLE_ROLE_OPTIONS } from "../../constants/enums";
import { getErrorMessage } from "../../utils/errorHandler";

export interface InviteStaffDialogProps {
  open: boolean;
  onClose: () => void;
}

// Owner-only: invite a new ADMIN/HR staff member by email. Self-contained —
// owns the invite mutation and form. Hosted in the Part 1 FormDialog.
export default function InviteStaffDialog({ open, onClose }: InviteStaffDialogProps) {
  const invite = useInviteStaff();
  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<InviteStaffFormData>({
    resolver: zodResolver(inviteStaffSchema),
    defaultValues: { name: "", email: "", role: CompanyRole.ADMIN },
  });

  const close = () => {
    if (invite.isPending) return;
    reset();
    onClose();
  };

  const onValid = (values: InviteStaffFormData) => {
    invite.mutate(values, {
      onSuccess: () => {
        toast.success(`Invitation sent to ${values.email}`);
        reset();
        onClose();
      },
      onError: (error) => toast.error(getErrorMessage(error)),
    });
  };

  return (
    <FormDialog
      open={open}
      title="Invite staff"
      onClose={close}
      onSubmit={handleSubmit(onValid)}
      submitLabel="Send invitation"
      loading={invite.isPending}
      maxWidth="xs"
    >
      <Stack spacing={2.5} sx={{ pt: 1 }}>
        <TextField
          label="Full name"
          fullWidth
          autoFocus
          required
          disabled={invite.isPending}
          {...register("name")}
          error={!!errors.name}
          helperText={errors.name?.message ?? " "}
        />
        <TextField
          label="Email address"
          type="email"
          fullWidth
          required
          disabled={invite.isPending}
          {...register("email")}
          error={!!errors.email}
          helperText={errors.email?.message ?? " "}
        />
        <Controller
          name="role"
          control={control}
          render={({ field }) => (
            <TextField
              select
              label="Role"
              fullWidth
              required
              disabled={invite.isPending}
              {...field}
              error={!!errors.role}
              helperText={errors.role?.message ?? "Admins and HR managers can be invited."}
            >
              {INVITABLE_ROLE_OPTIONS.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>
          )}
        />
      </Stack>
    </FormDialog>
  );
}
