import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Box, Button, CircularProgress, MenuItem, TextField } from "@mui/material";

import { employeeSchema } from "../../schemas/employee.schema";
import type { EmployeeFormData } from "../../schemas/employee.schema";
import { GENDER_OPTIONS } from "../../constants/enums";
import type { Department } from "../../types";

export interface EmployeeFormProps {
  mode: "create" | "edit";
  initialValues?: EmployeeFormData;
  departments: Department[];
  departmentsLoading?: boolean;
  onSubmit: (values: EmployeeFormData) => void;
  loading?: boolean;
  onCancel?: () => void;
}

// All-empty defaults — used for create mode and to reset between records.
const EMPTY_VALUES: EmployeeFormData = {
  employeeCode: "",
  name: "",
  email: "",
  phoneNumber: "",
  dateOfBirth: "",
  gender: "",
  address: "",
  designation: "",
  departmentId: "",
  joinDate: "",
  panNumber: "",
  aadhaarNo: "",
};

// One reusable form for both create and edit. The parent supplies `mode`, the
// preloaded values and the submit handler — no create/edit branching lives
// here (mirrors the DepartmentForm contract).
export default function EmployeeForm({
  mode,
  initialValues,
  departments,
  departmentsLoading = false,
  onSubmit,
  loading = false,
  onCancel,
}: EmployeeFormProps) {
  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isDirty },
  } = useForm<EmployeeFormData>({
    resolver: zodResolver(employeeSchema),
    defaultValues: initialValues ?? EMPTY_VALUES,
  });

  // Re-sync when the edited record changes (the parent memoizes
  // `initialValues`, so this only fires when the target employee changes).
  useEffect(() => {
    reset(initialValues ?? EMPTY_VALUES);
  }, [initialValues, reset]);

  const submitLabel = mode === "create" ? "Create Employee" : "Save Changes";

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
          label="Employee Code"
          required
          fullWidth
          disabled={loading}
          {...register("employeeCode")}
          error={!!errors.employeeCode}
          helperText={errors.employeeCode?.message ?? " "}
        />

        <TextField
          label="Designation"
          fullWidth
          disabled={loading}
          {...register("designation")}
          error={!!errors.designation}
          helperText={errors.designation?.message ?? " "}
        />

        <TextField
          label="Full Name"
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
          helperText={errors.email?.message ?? "Required to enable self-service login"}
        />

        <TextField
          label="Phone Number"
          fullWidth
          disabled={loading}
          {...register("phoneNumber")}
          error={!!errors.phoneNumber}
          helperText={errors.phoneNumber?.message ?? " "}
        />

        <Controller
          name="departmentId"
          control={control}
          render={({ field }) => (
            <TextField
              select
              label="Department"
              fullWidth
              disabled={loading || departmentsLoading}
              {...field}
              value={field.value ?? ""}
              error={!!errors.departmentId}
              helperText={errors.departmentId?.message ?? " "}
            >
              <MenuItem value="">None</MenuItem>
              {departments.map((department) => (
                <MenuItem key={department.id} value={department.id}>
                  {department.name}
                </MenuItem>
              ))}
            </TextField>
          )}
        />

        <Controller
          name="gender"
          control={control}
          render={({ field }) => (
            <TextField
              select
              label="Gender"
              fullWidth
              disabled={loading}
              {...field}
              value={field.value ?? ""}
              error={!!errors.gender}
              helperText={errors.gender?.message ?? " "}
            >
              <MenuItem value="">Not specified</MenuItem>
              {GENDER_OPTIONS.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>
          )}
        />

        <TextField
          label="Join Date"
          type="date"
          fullWidth
          disabled={loading}
          {...register("joinDate")}
          error={!!errors.joinDate}
          helperText={errors.joinDate?.message ?? " "}
          slotProps={{ inputLabel: { shrink: true } }}
        />

        <TextField
          label="Date of Birth"
          type="date"
          fullWidth
          disabled={loading}
          {...register("dateOfBirth")}
          error={!!errors.dateOfBirth}
          helperText={errors.dateOfBirth?.message ?? " "}
          slotProps={{ inputLabel: { shrink: true } }}
        />

        <TextField
          label="PAN Number"
          fullWidth
          disabled={loading}
          {...register("panNumber")}
          error={!!errors.panNumber}
          helperText={errors.panNumber?.message ?? " "}
        />

        <TextField
          label="Aadhaar Number"
          fullWidth
          disabled={loading}
          {...register("aadhaarNo")}
          error={!!errors.aadhaarNo}
          helperText={errors.aadhaarNo?.message ?? " "}
        />

        <Box sx={{ gridColumn: { xs: "auto", sm: "1 / -1" } }}>
          <TextField
            label="Address"
            fullWidth
            multiline
            minRows={2}
            disabled={loading}
            {...register("address")}
            error={!!errors.address}
            helperText={errors.address?.message ?? " "}
          />
        </Box>
      </Box>

      <Box
        sx={{ display: "flex", justifyContent: "flex-end", gap: 1.5, mt: 1 }}
      >
        {onCancel && (
          <Button variant="outlined" onClick={onCancel} disabled={loading}>
            Cancel
          </Button>
        )}
        <Button
          type="submit"
          variant="contained"
          disabled={loading || (mode === "edit" && !isDirty)}
          sx={{ minWidth: 170 }}
          startIcon={
            loading ? <CircularProgress size={16} color="inherit" /> : undefined
          }
        >
          {submitLabel}
        </Button>
      </Box>
    </Box>
  );
}
