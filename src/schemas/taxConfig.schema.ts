import { z } from "zod";

// Field types the backend accepts for custom declaration fields.
export const TAX_FIELD_TYPES = [
  "TEXT",
  "NUMBER",
  "AMOUNT",
  "DATE",
  "DROPDOWN",
  "RADIO",
  "CHECKBOX",
  "FILE",
  "TEXTAREA",
] as const;

// Numeric inputs are kept as strings in the forms (codebase convention) and
// parsed on submit.
const optionalAmount = z
  .string()
  .refine(
    (v) => v.trim() === "" || (Number.isInteger(Number(v)) && Number(v) >= 0),
    "Enter a whole rupee amount (0 or more)"
  );

const requiredAmount = z
  .string()
  .refine(
    (v) => Number.isInteger(Number(v)) && Number(v) >= 0,
    "Enter a whole rupee amount (0 or more)"
  );

// --- Custom field create form -----------------------------------------------
export const customFieldFormSchema = z.object({
  label: z.string().trim().min(1, "Label is required").max(200, "Too long"),
  fieldKey: z
    .string()
    .trim()
    .min(1, "Key is required")
    .max(60, "Too long")
    .regex(
      /^[a-zA-Z][a-zA-Z0-9_]*$/,
      "Letters, numbers and underscores; must start with a letter"
    ),
  fieldType: z.enum(TAX_FIELD_TYPES),
  isRequired: z.boolean(),
  maxAmount: optionalAmount,
  // "" = not attached to any section.
  sectionId: z.string(),
});
export type CustomFieldFormData = z.infer<typeof customFieldFormSchema>;

// --- Section overlay (enable / relabel / cap) -------------------------------
export const sectionConfigFormSchema = z.object({
  isEnabled: z.boolean(),
  overrideLabel: z.string().trim().max(120, "Too long"),
  overrideCap: optionalAmount,
});
export type SectionConfigFormData = z.infer<typeof sectionConfigFormSchema>;

// --- Standard deduction (per regime) ----------------------------------------
export const standardDeductionFormSchema = z.object({
  oldRegime: requiredAmount,
  newRegime: requiredAmount,
});
export type StandardDeductionFormData = z.infer<
  typeof standardDeductionFormSchema
>;
