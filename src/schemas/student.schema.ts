import { z } from "zod";

const optionalText = (max: number) =>
  z.string().trim().max(max).optional().or(z.literal(""));

export const studentSchema = z.object({
  name: z.string().trim().min(1, "Student name is required").max(150),
  email: z.string().trim().email("Enter a valid email").max(254),
  admissionNumber: z
    .string()
    .trim()
    .min(1, "Admission number is required")
    .max(64),
  departmentIds: z.array(z.string()),
  dateOfBirth: z.string().optional().or(z.literal("")),
  phone: optionalText(32),
  guardianName: optionalText(150),
  guardianPhone: optionalText(32),
  guardianEmail: z.string().trim().email("Enter a valid email").optional().or(z.literal("")),
  enrollmentDate: z.string().optional().or(z.literal("")),
});

export type StudentFormValues = z.infer<typeof studentSchema>;
