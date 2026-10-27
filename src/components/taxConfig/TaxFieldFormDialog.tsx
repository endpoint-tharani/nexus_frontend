import { useEffect, useMemo } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  FormControlLabel,
  MenuItem,
  Stack,
  Switch,
  TextField,
} from "@mui/material";

import { FormDialog } from "../ui";
import {
  TAX_FIELD_TYPES,
  customFieldFormSchema,
  type CustomFieldFormData,
} from "../../schemas/taxConfig.schema";
import type { CompanyConfigSection } from "../../types";

export interface TaxFieldFormDialogProps {
  open: boolean;
  // Sections the field can be attached to (optional — "" means standalone).
  sections: CompanyConfigSection[];
  loading?: boolean;
  onSubmit: (values: CustomFieldFormData) => void;
  onClose: () => void;
}

const DEFAULTS: CustomFieldFormData = {
  label: "",
  fieldKey: "",
  fieldType: "AMOUNT",
  isRequired: false,
  maxAmount: "",
  sectionId: "",
};

// Create a company-specific custom declaration field. The parent owns the
// mutation; this validates and hands back the values.
export default function TaxFieldFormDialog({
  open,
  sections,
  loading = false,
  onSubmit,
  onClose,
}: TaxFieldFormDialogProps) {
  const initialValues = useMemo<CustomFieldFormData>(() => DEFAULTS, []);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CustomFieldFormData>({
    resolver: zodResolver(customFieldFormSchema),
    defaultValues: initialValues,
  });

  useEffect(() => {
    if (open) reset(initialValues);
  }, [open, initialValues, reset]);

  const close = () => {
    if (loading) return;
    onClose();
  };

  return (
    <FormDialog
      open={open}
      title="Add custom field"
      onClose={close}
      onSubmit={handleSubmit(onSubmit)}
      submitLabel="Add field"
      loading={loading}
      maxWidth="xs"
    >
      <Stack spacing={2.5} sx={{ pt: 1 }}>
        <Controller
          name="label"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              label="Label"
              required
              fullWidth
              autoFocus
              disabled={loading}
              error={!!errors.label}
              helperText={errors.label?.message ?? " "}
            />
          )}
        />

        <Controller
          name="fieldKey"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              label="Field key"
              required
              fullWidth
              disabled={loading}
              error={!!errors.fieldKey}
              helperText={
                errors.fieldKey?.message ??
                "Unique identifier, e.g. driver_allowance"
              }
            />
          )}
        />

        <Controller
          name="fieldType"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              select
              label="Field type"
              fullWidth
              disabled={loading}
              error={!!errors.fieldType}
              helperText={errors.fieldType?.message ?? " "}
            >
              {TAX_FIELD_TYPES.map((t) => (
                <MenuItem key={t} value={t}>
                  {t}
                </MenuItem>
              ))}
            </TextField>
          )}
        />

        <Controller
          name="sectionId"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              select
              label="Attach to section"
              fullWidth
              disabled={loading}
              helperText="Optional"
            >
              <MenuItem value="">None (standalone)</MenuItem>
              {sections.map((s) => (
                <MenuItem key={s.sectionId} value={s.sectionId}>
                  {s.label}
                </MenuItem>
              ))}
            </TextField>
          )}
        />

        <Controller
          name="maxAmount"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              label="Max amount (₹)"
              type="number"
              fullWidth
              disabled={loading}
              error={!!errors.maxAmount}
              helperText={errors.maxAmount?.message ?? "Optional"}
            />
          )}
        />

        <Controller
          name="isRequired"
          control={control}
          render={({ field }) => (
            <FormControlLabel
              control={
                <Switch
                  checked={field.value}
                  onChange={(e) => field.onChange(e.target.checked)}
                  disabled={loading}
                />
              }
              label="Required field"
            />
          )}
        />
      </Stack>
    </FormDialog>
  );
}
