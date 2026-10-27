import { z } from "zod";
import { HOLIDAY_SCOPE_VALUES, HOLIDAY_TYPE_VALUES } from "../constants/enums";

export const holidaySchema = z
  .object({
    name: z.string().trim().min(1, "Holiday name is required").max(120, "Name is too long"),
    date: z.string().min(1, "Date is required"),
    type: z.enum(HOLIDAY_TYPE_VALUES),
    scope: z.enum(HOLIDAY_SCOPE_VALUES),
    branchId: z.string().optional().or(z.literal("")),
    isOptional: z.boolean().optional(),
    region: z.string().trim().max(80, "Region is too long").optional().or(z.literal("")),
    isActive: z.boolean().optional(),
  })
  .refine((v) => v.scope !== "BRANCH" || !!v.branchId, {
    message: "Select a branch for a branch-specific holiday",
    path: ["branchId"],
  });

export type HolidayFormData = z.infer<typeof holidaySchema>;
