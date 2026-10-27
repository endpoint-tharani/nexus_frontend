import { z } from "zod";
import { MONTHS } from "../constants/app";
import { INVITABLE_ROLES } from "../constants/enums";

// Company settings form. Mirrors the inline schema previously in Company.tsx,
// now centralized so the page and any future create flow share one source.
// Empty optional strings are normalized to undefined before submit.
const optionalText = z
  .string()
  .trim()
  .max(255, "Too long")
  .optional()
  .or(z.literal(""));

// Month <Select> values are strings ("1".."12") so the schema stays free of
// `z.coerce` (which would force the documented zodResolver<Input,…,Output>
// cast). The page converts the chosen month back to a number before submit.
const MONTH_VALUES = MONTHS.map((m) => String(m.value)) as [string, ...string[]];

export const companySchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Company name is required")
    .max(120, "Company name is too long"),
  email: z
    .string()
    .trim()
    .email("Enter a valid email")
    .optional()
    .or(z.literal("")),
  phone: optionalText,
  address: optionalText,
  // Phase 9 additions — see the ASSUMPTION note in company.types.ts.
  website: z
    .string()
    .trim()
    .url("Enter a valid URL (include https://)")
    .max(255, "Too long")
    .optional()
    .or(z.literal("")),
  financialYearStartMonth: z.enum(MONTH_VALUES).optional().or(z.literal("")),
  primaryCountryCode: z
    .string()
    .trim()
    .max(2, "Use the 2-letter country code (e.g. IN)")
    .optional()
    .or(z.literal("")),
  pan: optionalText,
  tan: optionalText,
});

export type CompanyFormData = z.infer<typeof companySchema>;

// Invite a new staff member (owner-only). Role is constrained to the invitable
// roles (ADMIN / HR) — OWNER/EMPLOYEE are not assignable through this flow.
// `name` is required by the backend (1..120 chars).
export const inviteStaffSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Name is required")
    .max(120, "Name is too long"),
  email: z.string().trim().email("Enter a valid email"),
  role: z.enum(INVITABLE_ROLES),
});

export type InviteStaffFormData = z.infer<typeof inviteStaffSchema>;
