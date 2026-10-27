// Structured API-error mapping (Part 3, Phase 13).
//
// `errorHandler.ts` turns a raw error into a single user-facing string (toast /
// banner copy). This module sits on top of it and exposes the *structured* view
// the forms need — `{ message, field, code, status }` plus helpers to drive the
// four surfaces an error can land on:
//
//   • toast errors  -> toastErrorMessage(err)          (alias of getErrorMessage)
//   • dialog errors -> toastErrorMessage(err)          (same friendly copy)
//   • form errors   -> getFieldErrors(err)             (field -> message map)
//   • inline field  -> applyFieldErrors(err, setError) (react-hook-form bridge)
//
// The backend error envelope only guarantees `{ error?: { message, code } }`
// today; field-level validation details are read defensively from the shapes a
// REST API commonly uses (`error.field`, `error.fields`, `error.errors[]`), so
// this keeps working whether or not the backend starts returning them.

import { getApiErrorMessage, getErrorMessage } from "./errorHandler";

// One validation problem tied to a specific input.
export interface FieldError {
  field: string;
  message: string;
}

// The normalized view of any thrown API error.
export interface ParsedApiError {
  /** Friendly, user-facing message (already mapped by `getErrorMessage`). */
  message: string;
  /** Machine-readable backend code, e.g. "EMAIL_TAKEN" (when provided). */
  code?: string;
  /** HTTP status, when the error came from a response. */
  status?: number;
  /** Per-field validation messages, keyed by field name (when provided). */
  fieldErrors: FieldError[];
}

// Loose shape we probe for structured details — every branch is optional so an
// unexpected payload simply yields no field errors rather than throwing.
interface RawErrorShape {
  response?: {
    status?: number;
    data?: {
      message?: string;
      error?: {
        message?: string;
        code?: string;
        field?: string;
        // Map form: { email: "Already taken" }.
        fields?: Record<string, string>;
        // Array form: [{ field, message }].
        errors?: Array<{ field?: string; message?: string }>;
      };
    };
  };
}

const asRaw = (err: unknown): RawErrorShape =>
  typeof err === "object" && err !== null ? (err as RawErrorShape) : {};

// Pull whatever field-level validation details the backend exposed into a flat,
// de-duplicated list. Tolerant of the three common encodings (single field,
// field->message map, array of {field,message}).
const extractFieldErrors = (err: unknown): FieldError[] => {
  const error = asRaw(err).response?.data?.error;
  if (!error) return [];

  const out: FieldError[] = [];
  const seen = new Set<string>();
  const push = (field?: string, message?: string) => {
    if (!field || seen.has(field)) return;
    seen.add(field);
    out.push({ field, message: message || "This value is invalid." });
  };

  if (error.field) push(error.field, error.message);
  if (error.fields) {
    for (const [field, message] of Object.entries(error.fields)) {
      push(field, message);
    }
  }
  if (Array.isArray(error.errors)) {
    for (const item of error.errors) push(item.field, item.message);
  }

  return out;
};

// Normalize any thrown value into the structured error view.
export const parseApiError = (err: unknown): ParsedApiError => {
  const raw = asRaw(err);
  const code = raw.response?.data?.error?.code;
  return {
    message: getErrorMessage(err),
    code,
    status: raw.response?.status,
    fieldErrors: extractFieldErrors(err),
  };
};

// Friendly copy for toast / dialog surfaces. Thin alias so callers can import a
// single, intention-revealing name from this module.
export const toastErrorMessage = (err: unknown): string => getErrorMessage(err);

// The untransformed backend message — for callers that branch on exact text
// (e.g. "Email not verified"). Re-exported so this is the one error module to
// import from.
export const rawApiErrorMessage = (err: unknown): string =>
  getApiErrorMessage(err);

// field -> message map for seeding form errors in one shot.
export const getFieldErrors = (err: unknown): Record<string, string> =>
  Object.fromEntries(
    extractFieldErrors(err).map(({ field, message }) => [field, message])
  );

// Bridge backend field errors onto a react-hook-form `setError`. Returns true
// when at least one inline error was applied, so the caller can decide whether
// to *also* show a toast (avoids double-reporting the same validation failure).
export const applyFieldErrors = (
  err: unknown,
  setError: (field: string, error: { type: string; message: string }) => void
): boolean => {
  const fieldErrors = extractFieldErrors(err);
  for (const { field, message } of fieldErrors) {
    setError(field, { type: "server", message });
  }
  return fieldErrors.length > 0;
};
