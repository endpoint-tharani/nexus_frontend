// Shared response/transport types used across every feature module.

// Every backend response is wrapped in this envelope: { success, message, data }.
export interface ApiEnvelope<T> {
  success: boolean;
  message: string;
  data: T;
}

// Error envelope as surfaced by the API. `errorHandler.ts` reads
// `error.message` first, then falls back to the top-level `message`.
export interface ApiErrorBody {
  success: false;
  message?: string;
  error?: {
    message?: string;
    code?: string;
  };
}

// Pagination metadata returned alongside list endpoints.
// ASSUMPTION: the employee list returns { items, total, page, limit, totalPages }.
export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// A paginated list payload (the `data` field of the envelope).
export interface Paginated<T> extends PaginationMeta {
  items: T[];
}

// Convenience aliases for the two common envelope shapes.
export type ApiResponse<T> = ApiEnvelope<T>;
export type PaginatedResponse<T> = ApiEnvelope<Paginated<T>>;

// The pagination shape the newer list endpoints (shift / holiday / branch /
// attendance) actually return: `{ items, meta }` where meta uses `pageSize`
// (not `limit`) and adds `hasNextPage` / `hasPrevPage`. Kept distinct from the
// legacy `Paginated<T>` above so the two contracts never get conflated.
export interface BackendPageMeta {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface BackendPaginated<T> {
  items: T[];
  meta: BackendPageMeta;
}

// Envelope for endpoints that carry no payload (just success + message),
// e.g. delete / change-password / logout-all-devices.
export type MessageResponse = ApiEnvelope<null>;

// Base query params shared by paginated/searchable list endpoints.
export interface PaginationParams {
  page?: number;
  limit?: number;
}

// Backend monetary values arrive as strings or numbers depending on endpoint.
export type Money = string | number;

// A presigned-S3 upload handshake response. The backend returns the object
// key as `key` (not `fileKey`); send it back as `sourceFileKey` when registering.
export interface UploadUrlResponse {
  uploadUrl: string;
  key: string;
}
