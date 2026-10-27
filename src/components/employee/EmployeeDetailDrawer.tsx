import type { ReactNode } from "react";
import { Avatar, Box, Button, Chip, Divider, Stack, Typography } from "@mui/material";

import {
  FormDrawer,
  StatusChip,
  DateText,
  EmptyState,
  LoadingSkeleton,
} from "../ui";
import { useEmployee } from "../../hooks/employee";
import { GENDER_LABELS } from "../../constants/enums";
import type { Gender } from "../../constants/enums";
import { initial } from "../../utils/format";
import type { Employee } from "../../types";

export interface EmployeeDetailDrawerProps {
  open: boolean;
  /** The row that opened the drawer — shown immediately while detail loads. */
  employee: Employee | null;
  onClose: () => void;
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <Box>
      <Typography variant="caption" color="text.secondary">
        {label}
      </Typography>
      <Typography variant="body2" sx={{ mt: 0.25, fontWeight: 500, wordBreak: "break-word" }}>
        {children ?? "—"}
      </Typography>
    </Box>
  );
}

function Group({ title, children }: { title: string; children: ReactNode }) {
  return (
    <Box>
      <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5 }}>
        {title}
      </Typography>
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2 }}>
        {children}
      </Box>
    </Box>
  );
}

// Gender is a free-text string on the backend; map the known enum values to
// friendly labels and fall back to the raw value for anything else.
const genderLabel = (gender?: string | null): string | null => {
  if (!gender) return null;
  return GENDER_LABELS[gender as Gender] ?? gender;
};

// Read-only employee detail panel. Renders the row's data immediately and
// backfills the full record (tax/KYC/login) from GET /employee/get-employee.
export default function EmployeeDetailDrawer({
  open,
  employee,
  onClose,
}: EmployeeDetailDrawerProps) {
  const employeeId = employee?.id;
  const { data: detail, isLoading } = useEmployee(open ? employeeId : undefined);
  const emp = detail ?? employee;
  const loginEnabled = !!emp?.userId;

  return (
    <FormDrawer
      open={open}
      title="Employee details"
      onClose={onClose}
      width={480}
      actions={
        <Button variant="outlined" onClick={onClose}>
          Close
        </Button>
      }
    >
      {!emp ? (
        isLoading ? (
          <LoadingSkeleton variant="form" rows={6} />
        ) : (
          <EmptyState dense title="No employee selected" />
        )
      ) : (
        <Stack spacing={3}>
          {/* Header */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Avatar sx={{ width: 56, height: 56, bgcolor: "primary.main", fontWeight: 700 }}>
              {initial(emp.name)}
            </Avatar>
            <Box sx={{ minWidth: 0 }}>
              <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
                {emp.name}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {emp.employeeCode || "No employee ID"}
              </Typography>
              <Box sx={{ display: "flex", gap: 1, mt: 1, flexWrap: "wrap" }}>
                <StatusChip kind="employee" status={emp.status} />
                <Chip
                  size="small"
                  variant="outlined"
                  color={loginEnabled ? "success" : "default"}
                  label={loginEnabled ? "Login enabled" : "Login disabled"}
                />
              </Box>
            </Box>
          </Box>

          <Divider />

          <Group title="Personal information">
            <Field label="Email">{emp.email}</Field>
            <Field label="Phone">{emp.phoneNumber}</Field>
            <Field label="Gender">{genderLabel(emp.gender)}</Field>
            <Field label="Date of birth">
              <DateText value={emp.dateOfBirth} variant="body2" sx={{ fontWeight: 500 }} />
            </Field>
            <Box sx={{ gridColumn: { xs: "auto", sm: "1 / -1" } }}>
              <Field label="Address">{emp.address}</Field>
            </Box>
          </Group>

          <Divider />

          <Group title="Employment">
            <Field label="Designation">{emp.designation}</Field>
            <Field label="Department">{emp.department?.name}</Field>
            <Field label="Join date">
              <DateText value={emp.joinDate} variant="body2" sx={{ fontWeight: 500 }} />
            </Field>
            <Field label="Employee status">
              <StatusChip kind="employee" status={emp.status} />
            </Field>
          </Group>

          <Divider />

          <Group title="Tax & KYC">
            <Field label="PAN">{emp.panNumber}</Field>
            <Field label="Aadhaar">{emp.aadhaarNo}</Field>
          </Group>

          <Divider />

          <Group title="Account">
            <Field label="Self-service login">{loginEnabled ? "Enabled" : "Disabled"}</Field>
          </Group>
        </Stack>
      )}
    </FormDrawer>
  );
}
