import { useEffect, useMemo } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormControlLabel, Stack, Switch, TextField, Typography } from "@mui/material";

import { FormDialog } from "../ui";
import {
  sectionConfigFormSchema,
  type SectionConfigFormData,
} from "../../schemas/taxConfig.schema";
import type { CompanyConfigSection } from "../../types";

export interface SectionConfigDialogProps {
  open: boolean;
  section: CompanyConfigSection | null;
  loading?: boolean;
  onSubmit: (values: SectionConfigFormData) => void;
  onClose: () => void;
}

const amt = (n: number | null | undefined): string => (n != null ? String(n) : "");

// Edit one master section's overlay for this company + FY: enable/disable,
// relabel, and tighten the cap. The parent owns the mutation.
export default function SectionConfigDialog({
  open,
  section,
  loading = false,
  onSubmit,
  onClose,
}: SectionConfigDialogProps) {
  const initialValues = useMemo<SectionConfigFormData>(
    () => ({
      isEnabled: section?.isEnabled ?? true,
      overrideLabel: section?.label ?? "",
      overrideCap: amt(section?.cap),
    }),
    [section]
  );

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<SectionConfigFormData>({
    resolver: zodResolver(sectionConfigFormSchema),
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
      title={section ? `Configure “${section.masterLabel}”` : "Configure section"}
      onClose={close}
      onSubmit={handleSubmit(onSubmit)}
      submitLabel="Save"
      loading={loading}
      maxWidth="xs"
    >
      <Stack spacing={2.5} sx={{ pt: 1 }}>
        {section && (
          <Typography variant="body2" color="text.secondary">
            {section.shortName} ·{" "}
            {section.allowedOld && section.allowedNew
              ? "Both regimes"
              : section.allowedOld
                ? "Old regime only"
                : section.allowedNew
                  ? "New regime only"
                  : "Not allowed"}
            {section.statutoryCap != null
              ? ` · Statutory cap ₹${section.statutoryCap.toLocaleString("en-IN")}`
              : ""}
          </Typography>
        )}

        <Controller
          name="isEnabled"
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
              label="Enabled for employees"
            />
          )}
        />

        <Controller
          name="overrideLabel"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              label="Display label"
              fullWidth
              disabled={loading}
              error={!!errors.overrideLabel}
              helperText={errors.overrideLabel?.message ?? " "}
            />
          )}
        />

        <Controller
          name="overrideCap"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              label="Company cap (₹)"
              type="number"
              fullWidth
              disabled={loading}
              error={!!errors.overrideCap}
              helperText={
                errors.overrideCap?.message ??
                "Leave blank to use the statutory cap."
              }
            />
          )}
        />
      </Stack>
    </FormDialog>
  );
}
