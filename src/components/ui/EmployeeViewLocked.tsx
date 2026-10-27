import { MdLockOutline } from "react-icons/md";
import EmptyState from "./EmptyState";

export interface EmployeeViewLockedProps {
  /** What's locked, e.g. "pay statement" — folded into the description. */
  feature?: string;
}

// Shown on employee self-service pages when the admin has turned off employee
// access for the company (company.employeeViewEnabled === false). Built on
// EmptyState so the locked surface matches the app's other empty/error states.
export default function EmployeeViewLocked({
  feature,
}: EmployeeViewLockedProps) {
  return (
    <EmptyState
      icon={<MdLockOutline size={44} />}
      title="Access is currently closed"
      description={
        feature
          ? `Your ${feature} is unavailable right now — your admin has turned off employee access. Please check back once it's re-enabled.`
          : "Your admin has turned off employee access. Please check back once it's re-enabled."
      }
    />
  );
}
