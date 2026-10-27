// The canonical error surface now lives in the design-system library
// (`components/ui/ErrorState`). This module re-exports it so existing imports
// from `components/common` keep working with no duplicated implementation.
export { default } from "../ui/ErrorState";
export type { ErrorStateProps } from "../ui/ErrorState";
