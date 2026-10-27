// Shift display + conversion helpers shared by the shift form, table and reports.
//
// The backend stores shift times as "minutes from midnight" (0..1439) and weekly
// offs as a 7-char Sun..Sat string ('1' = off). These helpers translate between
// that storage form and the "HH:mm" / human-readable shapes the UI uses.

import { WEEKDAYS } from "../constants/enums";

const pad2 = (n: number): string => String(n).padStart(2, "0");

// 540 -> "09:00". Null/undefined -> "" (the form leaves the field blank).
export const minutesToTime = (min: number | null | undefined): string => {
  if (min === null || min === undefined || Number.isNaN(min)) return "";
  const h = Math.floor(min / 60) % 24;
  const m = min % 60;
  return `${pad2(h)}:${pad2(m)}`;
};

// "09:00" -> 540. Empty/invalid -> null.
export const timeToMinutes = (value: string | null | undefined): number | null => {
  if (!value) return null;
  const match = /^(\d{1,2}):(\d{2})$/.exec(value.trim());
  if (!match) return null;
  const h = Number(match[1]);
  const m = Number(match[2]);
  if (h > 23 || m > 59) return null;
  return h * 60 + m;
};

// A compact "09:00 – 18:00" label, or "Flexible" when no fixed clock is set.
export const formatShiftTime = (
  startMin: number | null | undefined,
  endMin: number | null | undefined
): string => {
  if (startMin === null || startMin === undefined || endMin === null || endMin === undefined) {
    return "Flexible";
  }
  return `${minutesToTime(startMin)} – ${minutesToTime(endMin)}`;
};

// "1000001" -> ["Sun", "Sat"].
export const weeklyOffShorts = (pattern: string | null | undefined): string[] => {
  if (!pattern || pattern.length !== 7) return [];
  return WEEKDAYS.filter((d) => pattern[d.index] === "1").map((d) => d.short);
};

// "1000001" -> "Sun, Sat" (or "None" when no day is off).
export const formatWeeklyOff = (pattern: string | null | undefined): string => {
  const shorts = weeklyOffShorts(pattern);
  return shorts.length ? shorts.join(", ") : "None";
};

// Toggle one weekday in a 7-char pattern, returning the new pattern.
export const toggleWeeklyOffDay = (pattern: string, index: number): string => {
  const safe = pattern.length === 7 ? pattern : "0000000";
  const chars = safe.split("");
  chars[index] = chars[index] === "1" ? "0" : "1";
  return chars.join("");
};
