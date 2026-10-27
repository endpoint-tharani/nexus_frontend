import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Box,
  Button,
  FormControlLabel,
  MenuItem,
  Switch,
  TextField,
} from "@mui/material";

import {
  HOLIDAY_SCOPE_OPTIONS,
  HOLIDAY_TYPE_OPTIONS,
} from "../../constants/enums";
import { holidaySchema } from "../../schemas/holiday.schema";
import type { HolidayFormData } from "../../schemas/holiday.schema";
import type { Branch } from "../../types";

export interface HolidayFormProps {
  mode: "create" | "edit";
  initialValues?: HolidayFormData;
  branches: Branch[];
  branchesLoading?: boolean;
  onSubmit: (values: HolidayFormData) => void;
  loading?: boolean;
  onCancel?: () => void;
}

const EMPTY_VALUES: HolidayFormData = {
  name: "",
  date: "",
  type: "COMPANY",
  scope: "COMPANY",
  branchId: "",
  isOptional: false,
  region: "",
  isActive: true,
};

// Create / edit form for a holiday. Owns its own <form> + actions; the page
// wraps it in a Dialog.
export default function HolidayForm({
  mode,
  initialValues,
  branches,
  branchesLoading = false,
  onSubmit,
  loading = false,
  onCancel,
}: HolidayFormProps) {
  const {
    register,
    handleSubmit,
    control,
    watch,
    reset,
    formState: { errors },
  } = useForm<HolidayFormData>({
    resolver: zodResolver(holidaySchema),
    defaultValues: initialValues ?? EMPTY_VALUES,
  });

  useEffect(() => {
    reset(initialValues ?? EMPTY_VALUES);
  }, [initialValues, reset]);

  const isBranchScope = watch("scope") === "BRANCH";

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
          gap: 2,
          mt: 1,
        }}
      >
        <TextField
          label="Holiday name"
          required
          fullWidth
          disabled={loading}
          {...register("name")}
          error={!!errors.name}
          helperText={errors.name?.message ?? " "}
        />
        <TextField
          type="date"
          label="Date"
          required
          fullWidth
          disabled={loading}
          slotProps={{ inputLabel: { shrink: true } }}
          {...register("date")}
          error={!!errors.date}
          helperText={errors.date?.message ?? " "}
        />

        <Controller
          control={control}
          name="type"
          render={({ field }) => (
            <TextField
              select
              label="Type"
              fullWidth
              disabled={loading}
              {...field}
              error={!!errors.type}
              helperText={errors.type?.message ?? " "}
            >
              {HOLIDAY_TYPE_OPTIONS.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>
          )}
        />
        <Controller
          control={control}
          name="scope"
          render={({ field }) => (
            <TextField
              select
              label="Scope"
              fullWidth
              disabled={loading}
              {...field}
              error={!!errors.scope}
              helperText={errors.scope?.message ?? " "}
            >
              {HOLIDAY_SCOPE_OPTIONS.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>
          )}
        />

        <Controller
          control={control}
          name="branchId"
          render={({ field }) => (
            <TextField
              select
              label="Branch"
              required={isBranchScope}
              fullWidth
              disabled={loading || branchesLoading}
              value={field.value ?? ""}
              onChange={field.onChange}
              error={!!errors.branchId}
              helperText={
                errors.branchId?.message ??
                (isBranchScope ? "Required for branch-specific holidays" : "Optional")
              }
            >
              <MenuItem value="">No specific branch</MenuItem>
              {branches.map((branch) => (
                <MenuItem key={branch.id} value={branch.id}>
                  {branch.name}
                  {branch.code ? ` (${branch.code})` : ""}
                </MenuItem>
              ))}
            </TextField>
          )}
        />
        <TextField
          label="Region"
          fullWidth
          disabled={loading}
          {...register("region")}
          error={!!errors.region}
          helperText={errors.region?.message ?? "Optional (e.g. state / location)"}
        />
      </Box>

      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, mt: 1 }}>
        <Controller
          control={control}
          name="isOptional"
          render={({ field }) => (
            <FormControlLabel
              control={
                <Switch
                  checked={field.value ?? false}
                  onChange={(e) => field.onChange(e.target.checked)}
                  disabled={loading}
                />
              }
              label="Optional / restricted holiday"
            />
          )}
        />
        {mode === "edit" && (
          <Controller
            control={control}
            name="isActive"
            render={({ field }) => (
              <FormControlLabel
                control={
                  <Switch
                    checked={field.value ?? true}
                    onChange={(e) => field.onChange(e.target.checked)}
                    disabled={loading}
                  />
                }
                label="Active"
              />
            )}
          />
        )}
      </Box>

      <Box sx={{ display: "flex", gap: 1, mt: 3, justifyContent: "flex-end" }}>
        <Button disabled={loading} onClick={onCancel} color="inherit">
          Cancel
        </Button>
        <Button type="submit" variant="contained" disabled={loading}>
          {mode === "create" ? "Create holiday" : "Save changes"}
        </Button>
      </Box>
    </Box>
  );
}
