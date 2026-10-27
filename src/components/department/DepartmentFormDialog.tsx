import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Stack, TextField } from "@mui/material";

import { FormDialog } from "../ui";
import { departmentSchema } from "../../schemas/department.schema";
import type { DepartmentFormData } from "../../schemas/department.schema";

export interface DepartmentFormDialogProps {
  open: boolean;
  mode: "create" | "edit";
  initialValues: DepartmentFormData;
  loading?: boolean;
  onSubmit: (values: DepartmentFormData) => void;
  onClose: () => void;
}

// Create/edit a department inside the Part 1 FormDialog. The parent owns the
// mutation; this validates (existing zod schema) and hands back the values.
export default function DepartmentFormDialog({
  open,
  mode,
  initialValues,
  loading = false,
  onSubmit,
  onClose,
}: DepartmentFormDialogProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<DepartmentFormData>({
    resolver: zodResolver(departmentSchema),
    defaultValues: initialValues,
  });

  // Re-seed when (re)opened for a different record.
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
      title={mode === "create" ? "Create department" : "Edit department"}
      onClose={close}
      onSubmit={handleSubmit(onSubmit)}
      submitLabel={mode === "create" ? "Create" : "Save changes"}
      loading={loading}
      maxWidth="xs"
    >
      <Stack spacing={2.5} sx={{ pt: 1 }}>
        <TextField
          label="Department name"
          required
          fullWidth
          autoFocus
          disabled={loading}
          {...register("name")}
          error={!!errors.name}
          helperText={errors.name?.message ?? " "}
        />
        <TextField
          label="Description (optional)"
          fullWidth
          multiline
          minRows={3}
          disabled={loading}
          {...register("description")}
          error={!!errors.description}
          helperText={errors.description?.message ?? " "}
        />
      </Stack>
    </FormDialog>
  );
}
