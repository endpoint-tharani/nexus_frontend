import { z } from "zod";
import { TaxSection } from "../constants/enums";

const sectionValues = Object.values(TaxSection) as [
  TaxSection,
  ...TaxSection[]
];

// Add / edit a single proof item (shared by admin + self-service flows).
export const proofSchema = z.object({
  section: z.enum(sectionValues),
  amount: z.coerce
    .number()
    .positive("Amount must be greater than zero")
    .max(100_000_000, "Amount is too large"),
  description: z
    .string()
    .trim()
    .max(255, "Description is too long")
    .optional()
    .or(z.literal("")),
  referenceNo: z
    .string()
    .trim()
    .max(80, "Reference number is too long")
    .optional()
    .or(z.literal("")),
  // S3 object key for the uploaded proof document. There is no proof-upload-url
  // endpoint in tax.api yet, so the admin enters the key directly (free text).
  proofDocKey: z
    .string()
    .trim()
    .max(255, "Document key is too long")
    .optional()
    .or(z.literal("")),
});

export type ProofFormData = z.infer<typeof proofSchema>;

// Owner rejects a submitted declaration with a mandatory reason.
export const rejectionSchema = z.object({
  reason: z
    .string()
    .trim()
    .min(5, "Please provide a reason (at least 5 characters)")
    .max(500, "Reason is too long"),
});

export type RejectionFormData = z.infer<typeof rejectionSchema>;

const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
const tanRegex = /^[A-Z]{4}[0-9]{5}[A-Z]{1}$/;

export const previousEmploymentObjectSchema = z.object({
  employerName: z.string().min(1, "Employer name is required"),
  employerTan: z.string().regex(tanRegex, "Invalid TAN format (e.g. ABCD12345E)").optional().or(z.literal("")),
  employerPan: z.string().regex(panRegex, "Invalid PAN format (e.g. ABCDE1234F)").optional().or(z.literal("")),
  employmentFrom: z.string().min(1, "Employment From date is required"),
  employmentTo: z.string().min(1, "Employment To date is required"),
  grossSalary: z.coerce.number().min(0, "Gross salary must be ≥ 0"),
  taxableSalary: z.coerce.number().min(0, "Taxable salary must be ≥ 0"),
  professionalTax: z.coerce.number().min(0, "Professional tax must be ≥ 0").optional().default(0),
  tdsDeducted: z.coerce.number().min(0, "TDS deducted must be ≥ 0").optional().default(0),
  otherIncome: z.coerce.number().min(0, "Other income must be ≥ 0").optional().default(0),
  remarks: z.string().optional().or(z.literal("")),
  form16Attachment: z.string().optional().nullable(),
  salarySlipAttachment: z.string().optional().nullable(),
});

export const previousEmploymentSchema = previousEmploymentObjectSchema.refine((data) => {
  if (data.employmentFrom && data.employmentTo) {
    return new Date(data.employmentTo) >= new Date(data.employmentFrom);
  }
  return true;
}, {
  message: "Employment To date must be after or equal to Employment From date",
  path: ["employmentTo"],
});

export type PreviousEmploymentFormData = z.infer<typeof previousEmploymentObjectSchema>;
