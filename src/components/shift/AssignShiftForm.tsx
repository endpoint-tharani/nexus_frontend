import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Box, Button, MenuItem, TextField } from "@mui/material";

import { assignShiftSchema } from "../../schemas/shift.schema";
import type { AssignShiftFormData } from "../../schemas/shift.schema";
import type { Shift } from "../../types";
import { formatShiftTime } from "../../utils/shift";

export interface AssignEmployeeOption {
  id: string;
  name: string;
  employeeCode: string;
}

export interface AssignShiftFormProps {
  employees: AssignEmployeeOption[];
  employeesLoading?: boolean;
  shifts: Shift[];
  shiftsLoading?: boolean;
  defaultEmployeeId?: string;
  onSubmit: (values: AssignShiftFormData) => void;
  loading?: boolean;
  onCancel?: () => void;
}

const today = (): string => new Date().toISOString().slice(0, 10);

// Assign one employee to a shift from an effective date. History is preserved
// server-side (the previous assignment is closed automatically).
export default function AssignShiftForm({
  employees,
  employeesLoading = false,
  shifts,
  shiftsLoading = false,
  defaultEmployeeId,
  onSubmit,
  loading = false,
  onCancel,
}: AssignShiftFormProps) {
  const {
    handleSubmit,
    control,
    reset,
    register,
    formState: { errors },
  } = useForm<AssignShiftFormData>({
    resolver: zodResolver(assignShiftSchema),
    defaultValues: {
      employeeId: defaultEmployeeId ?? "",
      shiftId: "",
      effectiveFrom: today(),
      note: "",
    },
  });

  useEffect(() => {
    reset({
      employeeId: defaultEmployeeId ?? "",
      shiftId: "",
      effectiveFrom: today(),
      note: "",
    });
  }, [defaultEmployeeId, reset]);

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
      <Box sx={{ display: "grid", gridTemplateColumns: "1fr", gap: 2, mt: 1 }}>
        <Controller
          control={control}
          name="employeeId"
          render={({ field }) => (
            <TextField
              select
              label="Employee"
              required
              fullWidth
              disabled={loading || employeesLoading}
              {...field}
              error={!!errors.employeeId}
              helperText={errors.employeeId?.message ?? " "}
            >
              <MenuItem value="">Select an employee</MenuItem>
              {employees.map((employee) => (
                <MenuItem key={employee.id} value={employee.id}>
                  {employee.name}
                  {employee.employeeCode ? ` (${employee.employeeCode})` : ""}
                </MenuItem>
              ))}
            </TextField>
          )}
        />

        <Controller
          control={control}
          name="shiftId"
          render={({ field }) => (
            <TextField
              select
              label="Shift"
              required
              fullWidth
              disabled={loading || shiftsLoading}
              {...field}
              error={!!errors.shiftId}
              helperText={errors.shiftId?.message ?? " "}
            >
              <MenuItem value="">Select a shift</MenuItem>
              {shifts.map((shift) => (
                <MenuItem key={shift.id} value={shift.id}>
                  {shift.name} ({shift.code}) ·{" "}
                  {formatShiftTime(shift.startTimeMin, shift.endTimeMin)}
                </MenuItem>
              ))}
            </TextField>
          )}
        />

        <TextField
          type="date"
          label="Effective from"
          required
          fullWidth
          disabled={loading}
          slotProps={{ inputLabel: { shrink: true } }}
          {...register("effectiveFrom")}
          error={!!errors.effectiveFrom}
          helperText={errors.effectiveFrom?.message ?? " "}
        />

        <TextField
          label="Note"
          fullWidth
          multiline
          minRows={2}
          disabled={loading}
          {...register("note")}
          error={!!errors.note}
          helperText={errors.note?.message ?? "Optional"}
        />
      </Box>

      <Box sx={{ display: "flex", gap: 1, mt: 3, justifyContent: "flex-end" }}>
        <Button disabled={loading} onClick={onCancel} color="inherit">
          Cancel
        </Button>
        <Button type="submit" variant="contained" disabled={loading}>
          Assign shift
        </Button>
      </Box>
    </Box>
  );
}
