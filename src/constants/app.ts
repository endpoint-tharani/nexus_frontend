// App-wide constants: pagination defaults, calendar/month metadata and the
// accepted file types for the various upload flows.

export const DEFAULT_PAGE = 1;
export const DEFAULT_PAGE_SIZE = 10;
export const PAGE_SIZE_OPTIONS = [10, 25, 50, 100] as const;

// Calendar months, 1-indexed to match the backend (`month: 1..12`).
export const MONTHS = [
  { value: 1, label: "January", short: "Jan" },
  { value: 2, label: "February", short: "Feb" },
  { value: 3, label: "March", short: "Mar" },
  { value: 4, label: "April", short: "Apr" },
  { value: 5, label: "May", short: "May" },
  { value: 6, label: "June", short: "Jun" },
  { value: 7, label: "July", short: "Jul" },
  { value: 8, label: "August", short: "Aug" },
  { value: 9, label: "September", short: "Sep" },
  { value: 10, label: "October", short: "Oct" },
  { value: 11, label: "November", short: "Nov" },
  { value: 12, label: "December", short: "Dec" },
] as const;

// Spreadsheet uploads (bulk employee import, payroll source files).
export const SPREADSHEET_MIME_TYPES = [
  "text/csv",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
] as const;

export const SPREADSHEET_ACCEPT = ".csv,.xls,.xlsx";

// Proof-document uploads (tax declaration evidence).
export const PROOF_ACCEPT = ".pdf,.jpg,.jpeg,.png";

// Hard ceiling for client-side upload size (matches a typical S3/backend cap).
export const MAX_UPLOAD_BYTES = 10 * 1024 * 1024; // 10 MB
