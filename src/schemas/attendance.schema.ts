import { z } from "zod";

import { ATTENDANCE_STATUS_VALUES } from "../constants/enums";

// Mark a single employee-day. We always drive marking by `status` (the primary
// path); the backend also accepts a check-in/out pair, surfaced here as
// optional time hints. `isPaid` is an optional override (mainly to distinguish
// paid vs unpaid LEAVE — the backend otherwise derives it from the status).
export const markAttendanceSchema = z.object({
  employeeId: z.string().trim().min(1, "Select an employee"),
  date: z.string().trim().min(1, "Pick a date"),
  status: z.enum(ATTENDANCE_STATUS_VALUES),
  isPaid: z.boolean().optional(),
  remarks: z
    .string()
    .trim()
    .max(200, "Remarks are too long")
    .optional()
    .or(z.literal("")),
});

export type MarkAttendanceFormData = z.infer<typeof markAttendanceSchema>;

// Employee-facing correction request. `reason` is required by the backend;
// `requestedStatus` is the day classification the employee is asking for.
export const regularizationRequestSchema = z.object({
  date: z.string().trim().min(1, "Pick a date"),
  requestedStatus: z.enum(ATTENDANCE_STATUS_VALUES),
  reason: z
    .string()
    .trim()
    .min(1, "A reason is required")
    .max(300, "Reason is too long"),
});

export type RegularizationRequestFormData = z.infer<
  typeof regularizationRequestSchema
>;
