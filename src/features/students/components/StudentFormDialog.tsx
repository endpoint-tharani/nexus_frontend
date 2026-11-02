import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Box,
  Button,
  Checkbox,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormHelperText,
  InputLabel,
  MenuItem,
  Select,
  ListItemText,
  TextField,
} from "@mui/material";
import type { Department } from "../../../types";
import { studentSchema } from "../schemas/student.schema";
import type { StudentFormValues } from "../schemas/student.schema";

interface StudentFormDialogProps {
  open: boolean;
  departments: Department[];
  departmentsLoading?: boolean;
  loading?: boolean;
  onClose: () => void;
  onSubmit: (values: StudentFormValues) => void;
}

const EMPTY_VALUES: StudentFormValues = {
  name: "",
  email: "",
  admissionNumber: "",
  departmentIds: [],
  dateOfBirth: "",
  phone: "",
  guardianName: "",
  guardianPhone: "",
  guardianEmail: "",
  enrollmentDate: "",
};

export default function StudentFormDialog({
  open,
  departments,
  departmentsLoading = false,
  loading = false,
  onClose,
  onSubmit,
}: StudentFormDialogProps) {
  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<StudentFormValues>({
    resolver: zodResolver(studentSchema),
    defaultValues: EMPTY_VALUES,
  });

  useEffect(() => {
    if (open) reset(EMPTY_VALUES);
  }, [open, reset]);

  const handleClose = () => {
    if (!loading) onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
      <DialogTitle>Add student</DialogTitle>
      <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
        <DialogContent>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
              gap: 2,
              pt: 1,
            }}
          >
            <TextField
              label="Student name"
              required
              autoFocus
              disabled={loading}
              {...register("name")}
              error={Boolean(errors.name)}
              helperText={errors.name?.message ?? " "}
            />
            <TextField
              label="Admission number"
              required
              disabled={loading}
              {...register("admissionNumber")}
              error={Boolean(errors.admissionNumber)}
              helperText={errors.admissionNumber?.message ?? " "}
            />
            <TextField
              label="Email"
              type="email"
              required
              disabled={loading}
              {...register("email")}
              error={Boolean(errors.email)}
              helperText={errors.email?.message ?? "Account setup instructions will be sent to this address"}
            />
            <TextField
              label="Phone"
              disabled={loading}
              {...register("phone")}
              error={Boolean(errors.phone)}
              helperText={errors.phone?.message ?? " "}
            />
            <Controller
              name="departmentIds"
              control={control}
              render={({ field }) => (
                <FormControl fullWidth disabled={loading || departmentsLoading}>
                  <InputLabel id="student-departments-label">Departments</InputLabel>
                  <Select<string[]>
                    labelId="student-departments-label"
                    multiple
                    label="Departments"
                    value={field.value}
                    onChange={(event) => field.onChange(event.target.value)}
                    renderValue={(selected) =>
                      departments
                        .filter((department) => selected.includes(department.id))
                        .map((department) => department.name)
                        .join(", ") || "No departments"
                    }
                  >
                    {departments.map((department) => (
                      <MenuItem key={department.id} value={department.id}>
                        <Checkbox checked={field.value.includes(department.id)} />
                        <ListItemText primary={department.name} />
                      </MenuItem>
                    ))}
                  </Select>
                  <FormHelperText>
                    {departmentsLoading ? "Loading departments…" : " "}
                  </FormHelperText>
                </FormControl>
              )}
            />
            <TextField
              label="Date of birth"
              type="date"
              disabled={loading}
              {...register("dateOfBirth")}
              slotProps={{ inputLabel: { shrink: true } }}
              helperText=" "
            />
            <TextField
              label="Enrollment date"
              type="date"
              disabled={loading}
              {...register("enrollmentDate")}
              slotProps={{ inputLabel: { shrink: true } }}
              helperText=" "
            />
            <TextField
              label="Guardian name"
              disabled={loading}
              {...register("guardianName")}
              helperText=" "
            />
            <TextField
              label="Guardian phone"
              disabled={loading}
              {...register("guardianPhone")}
              error={Boolean(errors.guardianPhone)}
              helperText={errors.guardianPhone?.message ?? " "}
            />
            <TextField
              label="Guardian email"
              type="email"
              disabled={loading}
              {...register("guardianEmail")}
              error={Boolean(errors.guardianEmail)}
              helperText={errors.guardianEmail?.message ?? " "}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button onClick={handleClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={loading}
            startIcon={loading ? <CircularProgress size={16} color="inherit" /> : undefined}
          >
            Create student
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
}
