import { z } from "zod";
import { SHIFT_TYPE_VALUES } from "../constants/enums";

// react-hook-form works in the UI's units: times as "HH:mm" strings (converted
// to minutes-from-midnight in the page before hitting the API) and the weekly-off
// as the raw 7-char pattern the WeeklyOffPicker maintains.
const TIME_REGEX = /^([01]\d|2[0-3]):([0-5]\d)$/;
const optionalTime = z
  .string()
  .trim()
  .regex(TIME_REGEX, "Use 24h HH:mm")
  .optional()
  .or(z.literal(""));

export const shiftSchema = z
  .object({
    name: z.string().trim().min(1, "Shift name is required").max(80, "Name is too long"),
    code: z.string().trim().min(1, "Shift code is required").max(40, "Code is too long"),
    type: z.enum(SHIFT_TYPE_VALUES),
    branchId: z.string().optional().or(z.literal("")),
    startTime: optionalTime,
    endTime: optionalTime,
    // Registered with `valueAsNumber`, so these arrive as real numbers — no
    // coercion (which would make the form's input/output types diverge and break
    // react-hook-form's resolver typing).
    graceMinutes: z.number().int().min(0).max(240),
    breakMinutes: z.number().int().min(0).max(480),
    fullDayMinutes: z.number().int().min(1).max(1440),
    halfDayMinutes: z.number().int().min(1).max(1440),
    weeklyOffPattern: z
      .string()
      .regex(/^[01]{7}$/, "Pick the weekly-off days"),
    isActive: z.boolean().optional(),
  })
  .refine((v) => v.halfDayMinutes <= v.fullDayMinutes, {
    message: "Half-day minutes cannot exceed full-day minutes",
    path: ["halfDayMinutes"],
  })
  .refine((v) => v.type === "FLEXIBLE" || (!!v.startTime && !!v.endTime), {
    message: "Start and end time are required for non-flexible shifts",
    path: ["startTime"],
  });

export type ShiftFormData = z.infer<typeof shiftSchema>;

// Assign-shift form (single employee). `effectiveFrom` is a yyyy-mm-dd string.
export const assignShiftSchema = z.object({
  employeeId: z.string().min(1, "Select an employee"),
  shiftId: z.string().min(1, "Select a shift"),
  effectiveFrom: z.string().min(1, "Effective date is required"),
  note: z.string().trim().max(200, "Note is too long").optional().or(z.literal("")),
});

export type AssignShiftFormData = z.infer<typeof assignShiftSchema>;
