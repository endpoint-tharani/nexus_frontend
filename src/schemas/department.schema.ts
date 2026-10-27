import { z } from "zod";

// Department create/edit share the same shape.
export const departmentSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Department name must be at least 2 characters")
    .max(80, "Department name is too long"),
  // Optional — see the ASSUMPTION note in department.types.ts.
  description: z
    .string()
    .trim()
    .max(300, "Description is too long")
    .optional()
    .or(z.literal("")),
});

export type DepartmentFormData = z.infer<typeof departmentSchema>;
