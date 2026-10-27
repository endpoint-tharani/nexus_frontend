import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Box,
  Button,
  Divider,
  FormControlLabel,
  MenuItem,
  Switch,
  TextField,
} from "@mui/material";

import {
  DEFAULT_WEEKLY_OFF_PATTERN,
  SHIFT_TYPE_OPTIONS,
} from "../../constants/enums";
import { shiftSchema } from "../../schemas/shift.schema";
import type { ShiftFormData } from "../../schemas/shift.schema";
import type { Branch } from "../../types";
import WeeklyOffPicker from "./WeeklyOffPicker";

export interface ShiftFormProps {
  mode: "create" | "edit";
  initialValues?: ShiftFormData;
  branches: Branch[];
  branchesLoading?: boolean;
  onSubmit: (values: ShiftFormData) => void;
  loading?: boolean;
  onCancel?: () => void;
}

const EMPTY_VALUES: ShiftFormData = {
  name: "",
  code: "",
  type: "GENERAL",
  branchId: "",
  startTime: "09:00",
  endTime: "18:00",
  graceMinutes: 0,
  breakMinutes: 0,
  fullDayMinutes: 480,
  halfDayMinutes: 240,
  weeklyOffPattern: DEFAULT_WEEKLY_OFF_PATTERN,
  isActive: true,
};

// Create / edit form for a shift. Owns its own <form> + actions (mirrors
// EmployeeForm); the page wraps it in a Dialog. Times are HH:mm here and are
// converted to minutes-from-midnight by the page before calling the API.
export default function ShiftForm({
  mode,
  initialValues,
  branches,
  branchesLoading = false,
  onSubmit,
  loading = false,
  onCancel,
}: ShiftFormProps) {
  const {
    register,
    handleSubmit,
    control,
    watch,
    reset,
    formState: { errors },
  } = useForm<ShiftFormData>({
    resolver: zodResolver(shiftSchema),
    defaultValues: initialValues ?? EMPTY_VALUES,
  });

  useEffect(() => {
    reset(initialValues ?? EMPTY_VALUES);
  }, [initialValues, reset]);

  const isFlexible = watch("type") === "FLEXIBLE";

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
          label="Shift name"
          required
          fullWidth
          disabled={loading}
          {...register("name")}
          error={!!errors.name}
          helperText={errors.name?.message ?? " "}
        />
        <TextField
          label="Shift code"
          required
          fullWidth
          disabled={loading}
          {...register("code")}
          error={!!errors.code}
          helperText={errors.code?.message ?? " "}
        />

        <Controller
          control={control}
          name="type"
          render={({ field }) => (
            <TextField
              select
              label="Shift type"
              fullWidth
              disabled={loading}
              {...field}
              error={!!errors.type}
              helperText={errors.type?.message ?? " "}
            >
              {SHIFT_TYPE_OPTIONS.map((option) => (
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
              fullWidth
              disabled={loading || branchesLoading}
              value={field.value ?? ""}
              onChange={field.onChange}
              error={!!errors.branchId}
              helperText={errors.branchId?.message ?? "Optional — leave blank for all branches"}
            >
              <MenuItem value="">All branches (company-wide)</MenuItem>
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
          type="time"
          label="Start time"
          fullWidth
          disabled={loading || isFlexible}
          slotProps={{ inputLabel: { shrink: true } }}
          {...register("startTime")}
          error={!!errors.startTime}
          helperText={errors.startTime?.message ?? (isFlexible ? "Not used for flexible shifts" : " ")}
        />
        <TextField
          type="time"
          label="End time"
          fullWidth
          disabled={loading || isFlexible}
          slotProps={{ inputLabel: { shrink: true } }}
          {...register("endTime")}
          error={!!errors.endTime}
          helperText={errors.endTime?.message ?? (isFlexible ? "Not used for flexible shifts" : " ")}
        />

        <TextField
          type="number"
          label="Grace (minutes)"
          fullWidth
          disabled={loading}
          {...register("graceMinutes", { valueAsNumber: true })}
          error={!!errors.graceMinutes}
          helperText={errors.graceMinutes?.message ?? "Late-mark grace window"}
        />
        <TextField
          type="number"
          label="Break (minutes)"
          fullWidth
          disabled={loading}
          {...register("breakMinutes", { valueAsNumber: true })}
          error={!!errors.breakMinutes}
          helperText={errors.breakMinutes?.message ?? " "}
        />

        <TextField
          type="number"
          label="Full day (minutes)"
          fullWidth
          disabled={loading}
          {...register("fullDayMinutes", { valueAsNumber: true })}
          error={!!errors.fullDayMinutes}
          helperText={errors.fullDayMinutes?.message ?? "Worked minutes for a full day"}
        />
        <TextField
          type="number"
          label="Half day (minutes)"
          fullWidth
          disabled={loading}
          {...register("halfDayMinutes", { valueAsNumber: true })}
          error={!!errors.halfDayMinutes}
          helperText={errors.halfDayMinutes?.message ?? "Worked minutes for a half day"}
        />
      </Box>

      <Divider sx={{ my: 2 }} />

      <Controller
        control={control}
        name="weeklyOffPattern"
        render={({ field }) => (
          <WeeklyOffPicker
            value={field.value}
            onChange={field.onChange}
            disabled={loading}
            error={errors.weeklyOffPattern?.message}
          />
        )}
      />

      {mode === "edit" && (
        <Controller
          control={control}
          name="isActive"
          render={({ field }) => (
            <FormControlLabel
              sx={{ mt: 2 }}
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

      <Box sx={{ display: "flex", gap: 1, mt: 3, justifyContent: "flex-end" }}>
        <Button disabled={loading} onClick={onCancel} color="inherit">
          Cancel
        </Button>
        <Button type="submit" variant="contained" disabled={loading}>
          {mode === "create" ? "Create shift" : "Save changes"}
        </Button>
      </Box>
    </Box>
  );
}
