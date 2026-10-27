import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Box,
  Button,
  Checkbox,
  FormControlLabel,
  MenuItem,
  TextField,
} from "@mui/material";

import {
  ATTENDANCE_STATUS_OPTIONS,
  AttendanceStatus,
} from "../../constants/enums";
import {
  markAttendanceSchema,
  type MarkAttendanceFormData,
} from "../../schemas/attendance.schema";
import type { AttendanceEmployeeRef } from "../../types";

export interface MarkAttendanceFormProps {
  employees: AttendanceEmployeeRef[];
  employeesLoading?: boolean;
  initialValues: MarkAttendanceFormData;
  onSubmit: (values: MarkAttendanceFormData) => void;
  loading?: boolean;
  onCancel: () => void;
}

// Single-day attendance marking form. Marking is driven by `status` (the
// primary path); the "Paid day" override only appears for LEAVE, where it
// distinguishes paid vs unpaid leave.
export default function MarkAttendanceForm({
  employees,
  employeesLoading = false,
  initialValues,
  onSubmit,
  loading = false,
  onCancel,
}: MarkAttendanceFormProps) {
  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    formState: { errors },
  } = useForm<MarkAttendanceFormData>({
    resolver: zodResolver(markAttendanceSchema),
    defaultValues: initialValues,
  });

  useEffect(() => {
    reset(initialValues);
  }, [initialValues, reset]);

  const status = watch("status");
  const isLeave = status === AttendanceStatus.LEAVE;

  return (
    <Box
      component="form"
      onSubmit={handleSubmit(onSubmit)}
      sx={{ display: "flex", flexDirection: "column", gap: 2.5, pt: 1 }}
    >
      <Controller
        name="employeeId"
        control={control}
        render={({ field }) => (
          <TextField
            select
            label="Employee"
            required
            disabled={employeesLoading}
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

      <TextField
        type="date"
        label="Date"
        required
        {...register("date")}
        slotProps={{ inputLabel: { shrink: true } }}
        error={!!errors.date}
        helperText={errors.date?.message ?? " "}
      />

      <Controller
        name="status"
        control={control}
        render={({ field }) => (
          <TextField
            select
            label="Status"
            required
            {...field}
            error={!!errors.status}
            helperText={errors.status?.message ?? " "}
          >
            {ATTENDANCE_STATUS_OPTIONS.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </TextField>
        )}
      />

      {isLeave && (
        <Controller
          name="isPaid"
          control={control}
          render={({ field }) => (
            <FormControlLabel
              control={
                <Checkbox
                  checked={field.value ?? true}
                  onChange={(e) => field.onChange(e.target.checked)}
                />
              }
              label="Paid leave"
            />
          )}
        />
      )}

      <TextField
        label="Remarks"
        multiline
        minRows={2}
        {...register("remarks")}
        error={!!errors.remarks}
        helperText={errors.remarks?.message ?? "Optional"}
      />

      <Box sx={{ mt: 1, display: "flex", gap: 1, justifyContent: "flex-end" }}>
        <Button onClick={onCancel} color="inherit" disabled={loading}>
          Cancel
        </Button>
        <Button type="submit" variant="contained" disabled={loading}>
          Save attendance
        </Button>
      </Box>
    </Box>
  );
}
