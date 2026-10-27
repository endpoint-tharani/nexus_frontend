import { useCompanyStore } from "../../store/company.store";

// True only when an admin has EXPLICITLY disabled employee self-service for the
// active company (`employeeViewEnabled === false`). An absent flag — the backend
// hasn't adopted the toggle yet — is treated as OPEN, so the gate is opt-in and
// the pre-toggle behavior is preserved until a value is sent. The employee pages
// (My Tax, My Pay Statement) render a locked notice when this is true.
export const useEmployeeViewLocked = (): boolean =>
  useCompanyStore((s) => s.company?.employeeViewEnabled === false);
