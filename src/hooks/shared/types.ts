import type { UseQueryOptions } from "@tanstack/react-query";

// Options a caller may override on any of our query hooks. `queryKey` and
// `queryFn` are owned by the hook itself (built from shared keys + the API
// layer), so they're excluded — callers can still pass `enabled`, `staleTime`,
// `select`, `refetchInterval`, etc.
//
// `TData` is the unwrapped domain payload the hook returns (the envelope's
// `data` field), and the error type is the app-wide `Error`.
export type QueryConfig<TData> = Omit<
  UseQueryOptions<TData, Error, TData>,
  "queryKey" | "queryFn"
>;
