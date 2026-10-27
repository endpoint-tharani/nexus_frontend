import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Box, Button, CircularProgress, Stack, TextField } from "@mui/material";

import { companySchema } from "../../schemas/company.schema";
import type { CompanyFormData } from "../../schemas/company.schema";

export interface CompanyFormProps {
  initialValues: CompanyFormData;
  onSubmit: (values: CompanyFormData) => void;
  loading?: boolean;
  onCancel?: () => void;
  submitLabel?: string;
}

export default function CompanyForm({
  initialValues,
  onSubmit,
  loading = false,
  onCancel,
  submitLabel = "Save Changes",
}: CompanyFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<CompanyFormData>({
    resolver: zodResolver(companySchema),
    defaultValues: initialValues,
  });

  useEffect(() => {
    reset(initialValues);
  }, [initialValues, reset]);

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
      <Stack spacing={2.5} sx={{ mb: 3 }}>
        <TextField
          label="Organization name"
          required
          fullWidth
          autoFocus
          disabled={loading}
          {...register("name")}
          error={!!errors.name}
          helperText={errors.name?.message ?? " "}
        />
        <TextField
          label="Email"
          type="email"
          fullWidth
          disabled={loading}
          {...register("email")}
          error={!!errors.email}
          helperText={errors.email?.message ?? " "}
        />
        <TextField
          label="Phone"
          fullWidth
          disabled={loading}
          {...register("phone")}
          error={!!errors.phone}
          helperText={errors.phone?.message ?? " "}
        />
        <TextField
          label="Address"
          fullWidth
          multiline
          minRows={3}
          disabled={loading}
          {...register("address")}
          error={!!errors.address}
          helperText={errors.address?.message ?? " "}
        />
      </Stack>

      <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1.5 }}>
        {onCancel && (
          <Button variant="outlined" onClick={onCancel} disabled={loading}>
            Cancel
          </Button>
        )}
        <Button
          type="submit"
          variant="contained"
          disabled={loading || !isDirty}
          sx={{ minWidth: 170 }}
          startIcon={loading ? <CircularProgress size={16} color="inherit" /> : undefined}
        >
          {submitLabel}
        </Button>
      </Box>
    </Box>
  );
}
