import { useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import type { ColumnDef } from "@tanstack/react-table";
import {
  MdAdd,
  MdArchive,
  MdGroups,
  MdSchool,
} from "react-icons/md";
import toast from "react-hot-toast";

import { DataTable, SearchInput, StatCard } from "../../components/ui";
import StudentFormDialog from "../../components/student/StudentFormDialog";
import { useActiveBranch } from "../../hooks/branch";
import { useDepartments } from "../../hooks/department";
import {
  useAddStudentDepartment,
  useCreateStudent,
  useSetStudentStatus,
  useStudents,
} from "../../hooks/student";
import { useCurrentRole } from "../../hooks/user";
import { CompanyRole } from "../../constants/enums";
import type {
  CreateStudentPayload,
  Student,
  StudentListParams,
  StudentStatus,
} from "../../types";
import type { StudentFormValues } from "../../schemas/student.schema";
import { formatDate, formatNumber } from "../../utils/format";
import { getErrorMessage } from "../../utils";

const PAGE_SIZE_OPTIONS = [10, 20, 50, 100];

const STATUS_OPTIONS: Array<{ value: StudentStatus; label: string }> = [
  { value: "PENDING_APPROVAL", label: "Pending approval" },
  { value: "ACTIVE", label: "Active" },
  { value: "SUSPENDED", label: "Suspended" },
  { value: "INACTIVE", label: "Inactive" },
  { value: "ARCHIVED", label: "Archived" },
  { value: "REJECTED", label: "Rejected" },
];

const STATUS_COLORS: Record<
  StudentStatus,
  "default" | "success" | "warning" | "error"
> = {
  PENDING_APPROVAL: "warning",
  ACTIVE: "success",
  SUSPENDED: "warning",
  INACTIVE: "default",
  ARCHIVED: "default",
  REJECTED: "error",
};

const canArchiveStatus = (status: StudentStatus) =>
  status === "ACTIVE" || status === "SUSPENDED" || status === "INACTIVE";

const optionalValue = (value: string | undefined) => {
  const trimmed = value?.trim();
  return trimmed || undefined;
};

export default function Students() {
  const { selectedBranchId, branches } = useActiveBranch();
  const selectedBranch = branches.find((branch) => branch.id === selectedBranchId);
  return (
    <StudentsRoster
      key={selectedBranchId}
      selectedBranchId={selectedBranchId}
      selectedBranchName={selectedBranch?.name}
    />
  );
}

function StudentsRoster({
  selectedBranchId,
  selectedBranchName,
}: {
  selectedBranchId: string;
  selectedBranchName?: string;
}) {
  const role = useCurrentRole();
  const canArchive =
    role === CompanyRole.OWNER ||
    role === CompanyRole.ADMIN ||
    role === CompanyRole.COMPANY_ADMIN ||
    role === CompanyRole.SUPER_ADMIN;

  const [search, setSearch] = useState("");
  const [departmentId, setDepartmentId] = useState("");
  const [status, setStatus] = useState<StudentStatus | "">("");
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(20);
  const [createOpen, setCreateOpen] = useState(false);
  const [departmentStudent, setDepartmentStudent] = useState<Student | null>(null);
  const [departmentSelection, setDepartmentSelection] = useState("");
  const [archiveStudent, setArchiveStudent] = useState<Student | null>(null);

  const filters = useMemo<StudentListParams>(
    () => ({
      branchId: selectedBranchId || undefined,
      departmentId: departmentId || undefined,
      status: status || undefined,
      search: search || undefined,
      page: page + 1,
      limit: pageSize,
    }),
    [departmentId, page, pageSize, search, selectedBranchId, status]
  );

  const studentsQuery = useStudents(filters, { enabled: Boolean(selectedBranchId) });
  const totalQuery = useStudents(
    { branchId: selectedBranchId || undefined, page: 1, limit: 1 },
    { enabled: Boolean(selectedBranchId) }
  );
  const activeQuery = useStudents(
    { branchId: selectedBranchId || undefined, status: "ACTIVE", page: 1, limit: 1 },
    { enabled: Boolean(selectedBranchId) }
  );
  const pendingQuery = useStudents(
    {
      branchId: selectedBranchId || undefined,
      status: "PENDING_APPROVAL",
      page: 1,
      limit: 1,
    },
    { enabled: Boolean(selectedBranchId) }
  );
  const {
    data: departments = [],
    isLoading: departmentsLoading,
    isError: departmentsError,
    refetch: refetchDepartments,
  } = useDepartments({
    branchId: selectedBranchId || undefined,
    enabled: Boolean(selectedBranchId),
  });

  const createStudent = useCreateStudent();
  const addDepartment = useAddStudentDepartment();
  const setStudentStatus = useSetStudentStatus();
  const students = studentsQuery.data?.items ?? [];

  const columns = useMemo<ColumnDef<Student>[]>(
    () => [
      {
        id: "student",
        header: "Student",
        accessorFn: (student) => student.user.name,
        cell: ({ row }) => (
          <Stack spacing={0.25}>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              {row.original.user.name}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {row.original.user.email}
            </Typography>
          </Stack>
        ),
      },
      {
        accessorKey: "admissionNumber",
        header: "Admission no.",
      },
      {
        id: "departments",
        header: "Departments",
        enableSorting: false,
        cell: ({ row }) => {
          const memberships = row.original.memberships.filter(
            (membership) => membership.status === "ACTIVE"
          );
          return memberships.length ? (
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
              {memberships.map((membership) => (
                <Chip
                  key={membership.id}
                  label={membership.department.name}
                  size="small"
                  variant="outlined"
                />
              ))}
            </Box>
          ) : (
            <Typography variant="body2" color="text.secondary">
              No department
            </Typography>
          );
        },
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => (
          <Chip
            label={
              STATUS_OPTIONS.find((option) => option.value === row.original.status)
                ?.label ?? row.original.status
            }
            color={STATUS_COLORS[row.original.status]}
            size="small"
          />
        ),
      },
      {
        id: "enrolled",
        header: "Enrolled",
        accessorFn: (student) => student.enrollmentDate ?? student.createdAt,
        cell: ({ row }) => formatDate(row.original.enrollmentDate ?? row.original.createdAt),
      },
    ],
    []
  );

  const handleCreate = (values: StudentFormValues) => {
    if (!selectedBranchId) return;
    const payload: CreateStudentPayload = {
      name: values.name.trim(),
      email: values.email.trim(),
      admissionNumber: values.admissionNumber.trim(),
      branchId: selectedBranchId,
      departmentIds: values.departmentIds,
      dateOfBirth: optionalValue(values.dateOfBirth),
      enrollmentDate: optionalValue(values.enrollmentDate),
      phone: optionalValue(values.phone),
      guardianName: optionalValue(values.guardianName),
      guardianPhone: optionalValue(values.guardianPhone),
      guardianEmail: optionalValue(values.guardianEmail),
    };
    createStudent.mutate(payload, {
      onSuccess: () => {
        toast.success("Student added");
        setCreateOpen(false);
      },
      onError: (error) => toast.error(getErrorMessage(error)),
    });
  };

  const handleAddDepartment = () => {
    if (!departmentStudent || !departmentSelection) return;
    addDepartment.mutate(
      { studentId: departmentStudent.id, departmentId: departmentSelection },
      {
        onSuccess: () => {
          toast.success("Student added to department");
          setDepartmentStudent(null);
          setDepartmentSelection("");
        },
        onError: (error) => toast.error(getErrorMessage(error)),
      }
    );
  };

  const handleArchive = () => {
    if (!archiveStudent) return;
    setStudentStatus.mutate(
      { studentId: archiveStudent.id, status: "ARCHIVED" },
      {
        onSuccess: () => {
          toast.success("Student archived");
          setArchiveStudent(null);
        },
        onError: (error) => toast.error(getErrorMessage(error)),
      }
    );
  };

  const handleFilterChange = (update: () => void) => {
    update();
    setPage(0);
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
      <Box
        sx={{
          display: "flex",
          alignItems: { xs: "stretch", sm: "center" },
          justifyContent: "space-between",
          flexDirection: { xs: "column", sm: "row" },
          gap: 1.5,
        }}
      >
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            Students
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage student records and department enrollment
            {selectedBranchName ? ` · ${selectedBranchName}` : ""}
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<MdAdd />}
          disabled={!selectedBranchId}
          onClick={() => setCreateOpen(true)}
        >
          Add student
        </Button>
      </Box>

      {!selectedBranchId ? (
        <Alert severity="info">
          Select a branch from the navigation bar to view and manage its students.
        </Alert>
      ) : (
        <>
          <Grid container spacing={2}>
            <Grid size={{ xs: 6, sm: 3 }}>
              <StatCard
                label="Total students"
                value={formatNumber(totalQuery.data?.total ?? 0, "0")}
                icon={<MdGroups />}
                loading={totalQuery.isLoading}
              />
            </Grid>
            <Grid size={{ xs: 6, sm: 3 }}>
              <StatCard
                label="Active students"
                value={formatNumber(activeQuery.data?.total ?? 0, "0")}
                icon={<MdSchool />}
                color="success"
                loading={activeQuery.isLoading}
              />
            </Grid>
            <Grid size={{ xs: 6, sm: 3 }}>
              <StatCard
                label="Pending approval"
                value={formatNumber(pendingQuery.data?.total ?? 0, "0")}
                icon={<MdGroups />}
                color="warning"
                loading={pendingQuery.isLoading}
              />
            </Grid>
            <Grid size={{ xs: 6, sm: 3 }}>
              <StatCard
                label="Departments"
                value={formatNumber(departments.length, "0")}
                icon={<MdSchool />}
                color="secondary"
                loading={departmentsLoading}
              />
            </Grid>
          </Grid>

          {(totalQuery.isError || activeQuery.isError || pendingQuery.isError) && (
            <Alert severity="error">
              Student summary could not be loaded.{" "}
              <Button
                color="inherit"
                size="small"
                onClick={() => {
                  void totalQuery.refetch();
                  void activeQuery.refetch();
                  void pendingQuery.refetch();
                }}
              >
                Retry
              </Button>
            </Alert>
          )}

          <Stack
            direction={{ xs: "column", md: "row" }}
            spacing={1.5}
            sx={{ alignItems: { md: "center" } }}
          >
            <SearchInput
              value={search}
              onChange={(value) => handleFilterChange(() => setSearch(value.trim()))}
              placeholder="Search students by name, email or admission no."
              fullWidth
              sx={{ maxWidth: { md: 420 } }}
            />
            <FormControl size="small" sx={{ minWidth: 180 }}>
              <InputLabel id="student-department-filter-label">Department</InputLabel>
              <Select
                labelId="student-department-filter-label"
                value={departmentId}
                label="Department"
                onChange={(event) =>
                  handleFilterChange(() => setDepartmentId(event.target.value))
                }
              >
                <MenuItem value="">All departments</MenuItem>
                {departments.map((department) => (
                  <MenuItem key={department.id} value={department.id}>
                    {department.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl size="small" sx={{ minWidth: 180 }}>
              <InputLabel id="student-status-filter-label">Status</InputLabel>
              <Select
                labelId="student-status-filter-label"
                value={status}
                label="Status"
                onChange={(event) =>
                  handleFilterChange(
                    () => setStatus(event.target.value as StudentStatus | "")
                  )
                }
              >
                <MenuItem value="">All statuses</MenuItem>
                {STATUS_OPTIONS.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Stack>

          {departmentsError && (
            <Alert
              severity="error"
              action={
                <Button color="inherit" size="small" onClick={() => void refetchDepartments()}>
                  Retry
                </Button>
              }
            >
              Departments could not be loaded.
            </Alert>
          )}

          <DataTable
            columns={columns}
            data={students}
            loading={studentsQuery.isLoading}
            error={studentsQuery.isError ? getErrorMessage(studentsQuery.error) : null}
            onRetry={() => void studentsQuery.refetch()}
            ariaLabel="Students"
            emptyTitle={search || departmentId || status ? "No matching students" : "No students yet"}
            emptyDescription={
              search || departmentId || status
                ? "Try changing or clearing the filters."
                : "Add a student to start building this branch roster."
            }
            emptyAction={
              !search && !departmentId && !status ? (
                <Button variant="contained" onClick={() => setCreateOpen(true)}>
                  Add student
                </Button>
              ) : undefined
            }
            rowActions={(student) => {
              const memberships = student.memberships.filter(
                (membership) => membership.status === "ACTIVE"
              );
              const availableDepartments = departments.filter(
                (department) =>
                  !memberships.some(
                    (membership) => membership.departmentId === department.id
                  )
              );
              return (
                <Stack direction="row" sx={{ justifyContent: "flex-end" }}>
                  {student.status !== "ARCHIVED" && availableDepartments.length > 0 && (
                    <Tooltip title="Add to department">
                      <IconButton
                        size="small"
                        aria-label={`Add ${student.user.name} to a department`}
                        onClick={() => {
                          setDepartmentStudent(student);
                          setDepartmentSelection(availableDepartments[0]?.id ?? "");
                        }}
                      >
                        <MdAdd size={18} />
                      </IconButton>
                    </Tooltip>
                  )}
                  {canArchive && canArchiveStatus(student.status) && (
                    <Tooltip title="Archive student">
                      <IconButton
                        size="small"
                        color="warning"
                        aria-label={`Archive ${student.user.name}`}
                        onClick={() => setArchiveStudent(student)}
                      >
                        <MdArchive size={18} />
                      </IconButton>
                    </Tooltip>
                  )}
                </Stack>
              );
            }}
            getRowId={(student) => student.id}
            serverRowCount={studentsQuery.data?.total ?? 0}
            serverPage={page}
            serverRowsPerPage={pageSize}
            pageSizeOptions={PAGE_SIZE_OPTIONS}
            onServerPageChange={setPage}
            onServerRowsPerPageChange={(nextPageSize) => {
              setPageSize(nextPageSize);
              setPage(0);
            }}
          />
        </>
      )}

      <StudentFormDialog
        open={createOpen}
        departments={departments}
        departmentsLoading={departmentsLoading}
        loading={createStudent.isPending}
        onClose={() => setCreateOpen(false)}
        onSubmit={handleCreate}
      />

      <Dialog
        open={Boolean(departmentStudent)}
        onClose={() => !addDepartment.isPending && setDepartmentStudent(null)}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle>Add to department</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Choose a department for {departmentStudent?.user.name}.
          </Typography>
          <FormControl fullWidth size="small">
            <InputLabel id="student-add-department-label">Department</InputLabel>
            <Select
              labelId="student-add-department-label"
              label="Department"
              value={departmentSelection}
              onChange={(event) => setDepartmentSelection(event.target.value)}
            >
              {departments
                .filter(
                  (department) =>
                    !departmentStudent?.memberships.some(
                      (membership) =>
                        membership.status === "ACTIVE" &&
                        membership.departmentId === department.id
                    )
                )
                .map((department) => (
                  <MenuItem key={department.id} value={department.id}>
                    {department.name}
                  </MenuItem>
                ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button
            onClick={() => setDepartmentStudent(null)}
            disabled={addDepartment.isPending}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleAddDepartment}
            disabled={!departmentSelection || addDepartment.isPending}
          >
            Add department
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={Boolean(archiveStudent)}
        onClose={() => !setStudentStatus.isPending && setArchiveStudent(null)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Archive student?</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary">
            {archiveStudent?.user.name} will be archived and removed from the active roster.
            This action is recorded in the student activity history.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button
            onClick={() => setArchiveStudent(null)}
            disabled={setStudentStatus.isPending}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            color="warning"
            onClick={handleArchive}
            disabled={setStudentStatus.isPending}
          >
            Archive
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
