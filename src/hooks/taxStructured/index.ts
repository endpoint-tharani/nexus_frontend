// Barrel for the structured tax engine hooks (employee income heads).
export { useMyTaxForm } from "./useMyTaxForm";
export { useStructuredDeclaration } from "./useStructuredDeclaration";
export {
  useUpsertTaxEntry,
  useDeleteTaxEntry,
} from "./useEntryMutations";
export type {
  UpsertEntryArgs,
  DeleteEntryArgs,
} from "./useEntryMutations";
