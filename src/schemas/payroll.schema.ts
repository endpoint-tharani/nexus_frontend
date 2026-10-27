import { z } from "zod";
import { PayComponentType, PayrollUploadType } from "../constants/enums";

const uploadTypeValues = Object.values(PayrollUploadType) as [
  PayrollUploadType,
  ...PayrollUploadType[]
];

const componentTypeValues = Object.values(PayComponentType) as [
  PayComponentType,
  ...PayComponentType[]
];

// Register a payroll run after the source file is uploaded to S3.
export const registerRunSchema = z.object({
  year: z.coerce
    .number()
    .int()
    .min(2000, "Enter a valid year")
    .max(2100, "Enter a valid year"),
  month: z.coerce.number().int().min(1, "Select a month").max(12),
  uploadType: z.enum(uploadTypeValues),
  replace: z.boolean().optional(),
});

export type RegisterRunFormData = z.infer<typeof registerRunSchema>;

// A single editable pay component row.
export const payComponentSchema = z.object({
  code: z.string().trim().min(1, "Code is required"),
  name: z.string().trim().min(1, "Name is required"),
  type: z.enum(componentTypeValues),
  amount: z.coerce.number().min(0, "Amount cannot be negative"),
});

// Edit a payroll entry: full replace of its components + optional metadata.
export const updateEntrySchema = z.object({
  components: z
    .array(payComponentSchema)
    .min(1, "At least one component is required"),
  daysInMonth: z.coerce.number().int().min(1).max(31).optional(),
  effectiveWorkdays: z.coerce.number().min(0).max(31).optional(),
  remarks: z.string().trim().max(500, "Remarks are too long").optional(),
});

export type PayrollEntryFormData = z.infer<typeof updateEntrySchema>;
