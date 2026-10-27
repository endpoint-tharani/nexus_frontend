import { z } from "zod";

import { GENDER_VALUES } from "../constants/enums";

// Indian PAN: 5 letters, 4 digits, 1 letter (e.g. ABCDE1234F).
const PAN_REGEX = /^[A-Z]{5}[0-9]{4}[A-Z]$/;
// Indian Aadhaar: 12 digits.
const AADHAAR_REGEX = /^[0-9]{12}$/;

const optional = z.string().trim().optional().or(z.literal(""));

// Mirrors the backend createEmployeeSchema: `employeeCode` and `name` are
// required; `email` is optional (but needed before login can be enabled).
export const employeeSchema = z.object({
  employeeCode: z
    .string()
    .trim()
    .min(1, "Employee code is required")
    .max(40, "Employee code is too long"),
  name: z
    .string()
    .trim()
    .min(1, "Name is required")
    .max(120, "Name is too long"),
  email: z
    .string()
    .trim()
    .email("Enter a valid email")
    .optional()
    .or(z.literal("")),
  phoneNumber: z
    .string()
    .trim()
    .regex(/^[0-9+\-\s()]{7,15}$/, "Enter a valid phone number")
    .optional()
    .or(z.literal("")),
  designation: optional,
  departmentId: optional,
  joinDate: optional,
  dateOfBirth: optional,
  // Gender is constrained to the shared enum values (or empty = unset).
  gender: z.enum(GENDER_VALUES).optional().or(z.literal("")),
  address: z
    .string()
    .trim()
    .max(200, "Address is too long")
    .optional()
    .or(z.literal("")),
  panNumber: z
    .string()
    .trim()
    .toUpperCase()
    .regex(PAN_REGEX, "Enter a valid PAN (e.g. ABCDE1234F)")
    .optional()
    .or(z.literal("")),
  aadhaarNo: z
    .string()
    .trim()
    .regex(AADHAAR_REGEX, "Enter a valid 12-digit Aadhaar")
    .optional()
    .or(z.literal("")),
});

export type EmployeeFormData = z.infer<typeof employeeSchema>;
