// Tiny client-side CSV exporter. No dependency — every list/report screen builds
// a CSV from in-memory rows and triggers a browser download via `downloadBlob`.

import { downloadBlob } from "./download";

export type CsvCell = string | number | boolean | null | undefined;

// Escape a single field per RFC 4180: wrap in quotes when it contains a comma,
// quote or newline, doubling any embedded quotes.
const escapeCell = (value: CsvCell): string => {
  const str = value === null || value === undefined ? "" : String(value);
  if (/[",\n\r]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
};

// Build a CSV string from a header row + data rows.
export const toCsv = (headers: string[], rows: CsvCell[][]): string => {
  const lines = [headers, ...rows].map((row) => row.map(escapeCell).join(","));
  return lines.join("\r\n");
};

// Build the CSV and save it as `<fileName>.csv`. A leading BOM keeps Excel happy
// with UTF-8 (accented names, ₹, etc.).
export const downloadCsv = (
  fileName: string,
  headers: string[],
  rows: CsvCell[][]
): void => {
  const csv = toCsv(headers, rows);
  // Lead with a UTF-8 BOM so Excel renders accented names / ₹ correctly.
  const blob = new Blob([`﻿${csv}`], { type: "text/csv;charset=utf-8;" });
  const name = fileName.endsWith(".csv") ? fileName : `${fileName}.csv`;
  downloadBlob(blob, name);
};
