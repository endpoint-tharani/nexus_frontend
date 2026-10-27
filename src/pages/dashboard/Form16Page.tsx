import { useMemo, useState } from "react";
import {
  Autocomplete,
  Box,
  Button,
  Card,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  InputAdornment,
  MenuItem,
  Skeleton,
  TextField,
  Tooltip,
  Typography,
  Alert,
  LinearProgress,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import {
  MdSearch,
  MdRefresh,

  MdClose,
  MdPlayArrow,
  MdAutorenew,
  MdVisibility,
  MdPeople,
  MdCheckCircle,
  MdHourglassEmpty,
  MdCancel,
  MdDescription,
} from "react-icons/md";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import {
  DataTable,
  StatusChip,
  ConfirmDialog,
} from "../../components/ui";
import {
  useForm16List,
  useGenerateForm16,
  useGenerateBulkForm16,
  useRegenerateForm16,
} from "../../hooks/tax";
import { useEmployees } from "../../hooks/employee";
import { useDepartments } from "../../hooks/department";

import {
  FORM16_STATUS_OPTIONS,
  type Form16Status,
} from "../../constants/enums";
import type {
  Form16Record,
  Form16Summary as Form16SummaryType,
} from "../../types";
import {
  financialYearOptions,
  getErrorMessage,
  getFinancialYear,
  formatFinancialYear,
} from "../../utils";

const CURRENT_FY = getFinancialYear(new Date());
const FY_OPTIONS = financialYearOptions(CURRENT_FY, 5);

interface DetailDialogProps {
  open: boolean;
  record: Form16Record | null;
  onClose: () => void;
}

function DetailDialog({
  open,
  record,
  onClose,
}: DetailDialogProps) {
  if (!record) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ m: 0, p: 2, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Typography variant="h6" sx={{ fontWeight: 700 }}>
          Form 16 Details
        </Typography>
        <IconButton aria-label="close" onClick={onClose} sx={{ color: "text.secondary" }}>
          <MdClose />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers sx={{ p: 3 }}>
        <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2.5, mb: 3 }}>
          <Box>
            <Typography variant="caption" color="text.secondary">
              Employee Name
            </Typography>
            <Typography variant="body1" sx={{ fontWeight: 600 }}>
              {record.employeeName}
            </Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary">
              Employee ID (Code)
            </Typography>
            <Typography variant="body1" sx={{ fontWeight: 600 }}>
              {record.employeeCode}
            </Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary">
              PAN
            </Typography>
            <Typography variant="body1" sx={{ fontWeight: 600 }}>
              {record.pan ?? "—"}
            </Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary">
              Department
            </Typography>
            <Typography variant="body1" sx={{ fontWeight: 600 }}>
              {record.departmentName ?? "—"}
            </Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary">
              Financial Year
            </Typography>
            <Typography variant="body1" sx={{ fontWeight: 600 }}>
              {formatFinancialYear(record.year)}
            </Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary">
              Status
            </Typography>
            <Box sx={{ mt: 0.5 }}>
              <StatusChip kind="form16" status={record.status} />
            </Box>
          </Box>
          {record.generatedAt && (
            <Box>
              <Typography variant="caption" color="text.secondary">
                Generated Date
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 600 }}>
                {new Date(record.generatedAt).toLocaleString()}
              </Typography>
            </Box>
          )}

        </Box>

        {record.status === "FAILED" && record.errorReason && (
          <Alert severity="error" sx={{ mt: 1 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
              Generation Failed Reason:
            </Typography>
            <Typography variant="body2" sx={{ whiteSpace: "pre-wrap", mt: 0.5 }}>
              {record.errorReason}
            </Typography>
          </Alert>
        )}
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose} color="inherit">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}

interface SummaryCardsProps {
  summary: Form16SummaryType;
  loading: boolean;
}

function SummaryCards({ summary, loading }: SummaryCardsProps) {
  const base = summary.totalEmployees;

  const CARDS = [
    { key: "totalEmployees", label: "Total Employees", color: "primary", icon: <MdPeople size={22} /> },
    { key: "generatedCount", label: "Generated", color: "success", icon: <MdCheckCircle size={22} /> },
    { key: "pendingCount", label: "Pending", color: "warning", icon: <MdHourglassEmpty size={22} /> },
    { key: "failedCount", label: "Failed", color: "error", icon: <MdCancel size={22} /> },
  ] as const;

  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: {
          xs: "1fr",
          sm: "repeat(2, 1fr)",
          md: "repeat(4, 1fr)",
        },
        gap: 2,
        mb: 3,
      }}
    >
      {CARDS.map(({ key, label, color, icon }) => {
        const count = summary[key as keyof Form16SummaryType] as number;
        const showPct = key !== "totalEmployees" && base > 0;
        const pct = showPct ? Math.round((count / base) * 100) : null;

        return (
          <Card
            key={key}
            sx={{
              p: 2,
              height: "100%",
              display: "flex",
              alignItems: "center",
              gap: 2,
            }}
          >
            <Box
              aria-hidden
              sx={{
                flexShrink: 0,
                width: 44,
                height: 44,
                borderRadius: 2.5,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: `${color}.main`,
                bgcolor: (theme) => alpha(theme.palette[color].main, 0.12),
              }}
            >
              {icon}
            </Box>

            <Box sx={{ minWidth: 0 }}>
              <Typography variant="caption" color="text.secondary" noWrap sx={{ display: "block" }}>
                {label}
              </Typography>

              {loading ? (
                <Skeleton width={60} height={32} />
              ) : (
                <Box sx={{ display: "flex", alignItems: "baseline", gap: 1 }}>
                  <Typography variant="h5" sx={{ fontWeight: 700, lineHeight: 1.1 }}>
                    {count}
                  </Typography>
                  {pct !== null && (
                    <Typography variant="caption" color="text.secondary" noWrap>
                      {pct}% of {base}
                    </Typography>
                  )}
                </Box>
              )}
            </Box>
          </Card>
        );
      })}
    </Box>
  );
}

export default function Form16Page() {
  const navigate = useNavigate();

  // --- Filters ---
  const [year, setYear] = useState<number>(CURRENT_FY);
  const [status, setStatus] = useState<Form16Status | "">("");
  const [employeeId, setEmployeeId] = useState<string>("");
  const [departmentId, setDepartmentId] = useState<string>("");
  const [search, setSearch] = useState("");

  const hasActiveFilters =
    status !== "" || employeeId !== "" || departmentId !== "" || search.trim() !== "";

  const resetFilters = () => {
    setStatus("");
    setEmployeeId("");
    setDepartmentId("");
    setSearch("");
  };

  // --- API / Hooks ---
  const {
    data: form16List = [],
    isLoading: form16Loading,
    isError: form16Error,
    isFetching,
    refetch: refetchList,
  } = useForm16List(year);

  const { data: employees = [], isLoading: employeesLoading } = useEmployees({ limit: 500 });

  const employeeOptions = useMemo(
    () =>
      employees.map((e) => ({
        id: e.id,
        label: `${e.name}${e.employeeCode ? ` (${e.employeeCode})` : ""}`,
      })),
    [employees]
  );

  const selectedEmployeeOption = useMemo(
    () => employeeOptions.find((o) => o.id === employeeId) || null,
    [employeeOptions, employeeId]
  );
  const { data: departments = [] } = useDepartments();

  const generateSingle = useGenerateForm16();
  const generateBulk = useGenerateBulkForm16();
  const regenerateSingle = useRegenerateForm16();


  const isLoading = form16Loading || employeesLoading;

  // --- Merge and Client-side filter / search ---
  const mergedList = useMemo(() => {
    if (!employees.length) return [];
    
    const f16Map = new Map(form16List.map((f) => [f.employeeId, f]));

    return employees.map((emp) => {
      const f16 = f16Map.get(emp.id);
      return {
        id: f16?.id ?? `pending-${emp.id}`,
        employeeId: emp.id,
        employeeCode: emp.employeeCode,
        employeeName: emp.name,
        pan: emp.panNumber ?? null,
        departmentName: emp.department?.name ?? null,
        departmentId: emp.departmentId ?? null,
        year,
        generatedAt: f16?.generatedAt ?? null,
        status: (f16 ? "COMPLETED" : "PENDING") as Form16Status,
        errorReason: null,

      };
    });
  }, [employees, form16List, year]);

  const filteredList = useMemo(() => {
    return mergedList.filter((item) => {
      if (employeeId && item.employeeId !== employeeId) return false;
      if (departmentId && item.departmentId !== departmentId) return false;
      if (status && item.status !== status) return false;

      if (search.trim()) {
        const q = search.toLowerCase();
        const code = item.employeeCode?.toLowerCase() ?? "";
        const name = item.employeeName?.toLowerCase() ?? "";
        const pan = item.pan?.toLowerCase() ?? "";
        if (!code.includes(q) && !name.includes(q) && !pan.includes(q)) {
          return false;
        }
      }

      return true;
    });
  }, [mergedList, employeeId, departmentId, status, search]);

  const summary = useMemo<Form16SummaryType>(() => {
    const totalEmployees = mergedList.length;
    const generatedCount = mergedList.filter((item) => item.status === "COMPLETED").length;
    const pendingCount = mergedList.filter((item) => item.status === "PENDING").length;
    const failedCount = mergedList.filter((item) => item.status === "FAILED").length;

    return {
      financialYear: { start: year, end: year + 1, label: formatFinancialYear(year) },
      totalEmployees,
      generatedCount,
      pendingCount,
      failedCount,
    };
  }, [mergedList, year]);

  // --- Dialog Targets ---
  const [generateTarget, setGenerateTarget] = useState<typeof mergedList[number] | null>(null);
  const [regenerateTarget, setRegenerateTarget] = useState<typeof mergedList[number] | null>(null);
  const [bulkGenerateOpen, setBulkGenerateOpen] = useState(false);
  const [detailTarget, setDetailTarget] = useState<typeof mergedList[number] | null>(null);

  // --- Global Loading State for Mutations ---
  const isGenerating =
    generateSingle.isPending || generateBulk.isPending || regenerateSingle.isPending;

  const handleRefresh = () => {
    refetchList();
  };

  const handleSingleGenerate = async () => {
    if (!generateTarget) return;
    const target = generateTarget;
    setGenerateTarget(null);

    toast.promise(
      generateSingle.mutateAsync({
        employeeId: target.employeeId,
        year: target.year,
      }),
      {
        loading: `Generating Form 16 for ${target.employeeName}...`,
        success: "Form 16 generated successfully",
        error: (err) => `Failed to generate Form 16: ${getErrorMessage(err)}`,
      }
    );
  };

  const handleSingleRegenerate = async () => {
    if (!regenerateTarget) return;
    const target = regenerateTarget;
    setRegenerateTarget(null);

    toast.promise(
      regenerateSingle.mutateAsync({
        employeeId: target.employeeId,
        year: target.year,
      }),
      {
        loading: `Regenerating Form 16 for ${target.employeeName}...`,
        success: "Form 16 regenerated successfully",
        error: (err) => `Failed to regenerate Form 16: ${getErrorMessage(err)}`,
      }
    );
  };

  const handleBulkGenerate = async () => {
    setBulkGenerateOpen(false);

    toast.promise(
      generateBulk.mutateAsync(year),
      {
        loading: "Running bulk generation of Form 16...",
        success: "Bulk generation completed successfully",
        error: (err) => `Bulk generation failed: ${getErrorMessage(err)}`,
      }
    );
  };



  const columns = useMemo(() => {
    return [
      {
        accessorKey: "employeeCode",
        header: "Employee ID",
        cell: ({ row }: any) => row.original.employeeCode || row.original.employeeId,
      },
      {
        accessorKey: "employeeName",
        header: "Employee Name",
        cell: ({ row }: any) => (
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            {row.original.employeeName}
          </Typography>
        ),
      },
      {
        accessorKey: "pan",
        header: "PAN",
        cell: ({ row }: any) => row.original.pan ?? "—",
      },
      {
        accessorKey: "year",
        header: "Financial Year",
        cell: ({ row }: any) => formatFinancialYear(row.original.year),
      },
      {
        accessorKey: "generatedAt",
        header: "Generated Date",
        cell: ({ row }: any) =>
          row.original.generatedAt ? new Date(row.original.generatedAt).toLocaleDateString() : "—",
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }: any) => (
          <StatusChip kind="form16" status={row.original.status} />
        ),
      },
    ];
  }, []);

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "calc(100dvh - 112px)",
      }}
    >
      {/* Summary Cards */}
      <SummaryCards summary={summary} loading={isLoading} />

      {/* Action and Filter Toolbar */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 2,
          flexWrap: "wrap",
          borderBottom: 1,
          borderColor: "divider",
          pb: 1.5,
          mb: 1.5,
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: 700 }}>
          Form 16 Administration
        </Typography>

        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Tooltip title="Refresh">
            <span>
              <IconButton
                size="small"
                aria-label="Refresh data"
                onClick={handleRefresh}
                disabled={isFetching || isGenerating}
                sx={{ border: 1, borderColor: "divider", borderRadius: 1.5 }}
              >
                {isFetching || isGenerating ? (
                  <CircularProgress size={16} />
                ) : (
                  <MdRefresh size={18} />
                )}
              </IconButton>
            </span>
          </Tooltip>

          <Button
            variant="contained"
            size="small"
            color="primary"
            startIcon={generateBulk.isPending ? <CircularProgress size={14} color="inherit" /> : <MdPlayArrow />}
            onClick={() => setBulkGenerateOpen(true)}
            disabled={isGenerating || isFetching}
          >
            Bulk Generate
          </Button>
        </Box>
      </Box>

      {/* Filter Row */}
      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          gap: 1.5,
          mb: 2,
        }}
      >
        <TextField
          size="small"
          placeholder="Search employee ID, name, PAN…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{ flex: 1, minWidth: 240 }}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <MdSearch size={18} />
                </InputAdornment>
              ),
            },
          }}
        />

        <TextField
          select
          label="Financial Year"
          size="small"
          value={year}
          onChange={(e) => setYear(Number(e.target.value))}
          sx={{ minWidth: 150 }}
        >
          {FY_OPTIONS.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </TextField>

        <Autocomplete
          size="small"
          options={employeeOptions}
          loading={employeesLoading}
          value={selectedEmployeeOption}
          onChange={(_, next) => setEmployeeId(next?.id ?? "")}
          isOptionEqualToValue={(o, v) => o.id === v.id}
          sx={{ minWidth: 260 }}
          renderInput={(params) => (
            <TextField {...params} label="Employee" placeholder="Search name or code" />
          )}
        />

        <TextField
          select
          label="Department"
          size="small"
          value={departmentId}
          onChange={(e) => setDepartmentId(e.target.value)}
          sx={{ minWidth: 180 }}
        >
          <MenuItem value="">All departments</MenuItem>
          {departments.map((dept) => (
            <MenuItem key={dept.id} value={dept.id}>
              {dept.name}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          select
          label="Status"
          size="small"
          value={status}
          onChange={(e) => setStatus(e.target.value as Form16Status | "")}
          sx={{ minWidth: 150 }}
        >
          <MenuItem value="">All statuses</MenuItem>
          {FORM16_STATUS_OPTIONS.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </TextField>

        {hasActiveFilters && (
          <Button
            size="small"
            color="inherit"
            startIcon={<MdClose size={16} />}
            onClick={resetFilters}
          >
            Clear Filters
          </Button>
        )}
      </Box>

      {/* Table Container */}
      <Box sx={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column" }}>
        <DataTable
          columns={columns}
          data={filteredList}
          loading={isLoading}
          error={form16Error ? "Failed to load Form 16 records." : null}
          onRetry={handleRefresh}
          getRowId={(record) => record.id}
          enableColumnVisibility
          dense
          fillHeight
          ariaLabel="Form 16 records"
          emptyTitle="No Form 16 found"
          emptyDescription={
            hasActiveFilters
              ? "Try adjusting your filters or search terms."
              : "No Form 16 has been generated for this financial year."
          }
          emptyAction={
            !hasActiveFilters && mergedList.length === 0 ? (
              <Button
                variant="contained"
                color="primary"
                onClick={() => setBulkGenerateOpen(true)}
              >
                Generate Form 16
              </Button>
            ) : undefined
          }
          rowActions={(record) => {
            const isCompleted = record.status === "COMPLETED";
            const isGeneratingThis =
              generateSingle.isPending && generateSingle.variables?.employeeId === record.employeeId;
            const isRegeneratingThis =
              regenerateSingle.isPending && regenerateSingle.variables?.employeeId === record.employeeId;


            return (
              <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 0.5 }}>
                <Tooltip title="View Details">
                  <IconButton
                    size="small"
                    color="primary"
                    aria-label="view details"
                    onClick={(e) => {
                      e.stopPropagation();
                      setDetailTarget(record as any);
                    }}
                  >
                    <MdVisibility size={18} />
                  </IconButton>
                </Tooltip>

                {isCompleted && (
                  <Tooltip title="View Certificate">
                    <IconButton
                      size="small"
                      color="info"
                      aria-label="view Form 16 certificate"
                      onClick={(e) => {
                        e.stopPropagation();
                        const fy = `${record.year}-${String((record.year + 1) % 100).padStart(2, "0")}`;
                        navigate(`/dashboard/payroll/form16/${record.employeeId}?financialYear=${fy}`);
                      }}
                    >
                      <MdDescription size={18} />
                    </IconButton>
                  </Tooltip>
                )}

                {!isCompleted ? (
                  <Tooltip title="Generate">
                    <span>
                      <IconButton
                        size="small"
                        color="success"
                        aria-label="generate Form 16"
                        onClick={(e) => {
                          e.stopPropagation();
                          setGenerateTarget(record);
                        }}
                        disabled={isGenerating || record.status === "GENERATING"}
                      >
                        {isGeneratingThis ? <CircularProgress size={18} /> : <MdPlayArrow size={18} />}
                      </IconButton>
                    </span>
                  </Tooltip>
                ) : (
                  <Tooltip title="Regenerate">
                    <span>
                      <IconButton
                        size="small"
                        color="warning"
                        aria-label="regenerate Form 16"
                        onClick={(e) => {
                          e.stopPropagation();
                          setRegenerateTarget(record);
                        }}
                        disabled={isGenerating}
                      >
                        {isRegeneratingThis ? <CircularProgress size={18} /> : <MdAutorenew size={18} />}
                      </IconButton>
                    </span>
                  </Tooltip>
                )}


              </Box>
            );
          }}
        />
      </Box>

      {/* Confirmation Dialogs */}
      <ConfirmDialog
        open={!!generateTarget}
        title="Generate Form 16"
        message={
          generateTarget ? (
            <Typography variant="body2">
              Are you sure you want to generate Form 16 for <strong>{generateTarget.employeeName}</strong>?
              This will calculate tax computation and create the PDF document.
            </Typography>
          ) : undefined
        }
        confirmLabel="Generate"
        cancelLabel="Cancel"
        severity="primary"
        loading={generateSingle.isPending}
        onConfirm={handleSingleGenerate}
        onClose={() => setGenerateTarget(null)}
      />

      <ConfirmDialog
        open={!!regenerateTarget}
        title="Regenerate Form 16"
        message={
          regenerateTarget ? (
            <Typography variant="body2">
              Are you sure you want to regenerate Form 16 for <strong>{regenerateTarget.employeeName}</strong>?
              This will overwrite the existing generated Form 16 document.
            </Typography>
          ) : undefined
        }
        confirmLabel="Regenerate"
        cancelLabel="Cancel"
        severity="warning"
        loading={regenerateSingle.isPending}
        onConfirm={handleSingleRegenerate}
        onClose={() => setRegenerateTarget(null)}
      />

      <ConfirmDialog
        open={bulkGenerateOpen}
        title="Bulk Generate Form 16"
        message={
          <Typography variant="body2">
            Are you sure you want to trigger bulk Form 16 generation for all employees in the financial year{" "}
            <strong>{formatFinancialYear(year)}</strong>?
            This operation will run in the background.
          </Typography>
        }
        confirmLabel="Bulk Generate"
        cancelLabel="Cancel"
        severity="primary"
        loading={generateBulk.isPending}
        onConfirm={handleBulkGenerate}
        onClose={() => setBulkGenerateOpen(false)}
      />

      {/* Generation Progress Overlay Dialog */}
      <Dialog open={isGenerating}>
        <DialogTitle sx={{ fontWeight: 700 }}>
          {generateBulk.isPending ? "Generating Bulk Form 16..." : "Generating Form 16..."}
        </DialogTitle>
        <DialogContent sx={{ minWidth: 280, pb: 3, pt: 1 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Calculating tax structure and compiling the PDF Form 16 document. Please do not close this window.
          </Typography>
          <LinearProgress color="primary" />
        </DialogContent>
      </Dialog>

      {/* Details View */}
      <DetailDialog
        open={!!detailTarget}
        record={detailTarget as any}
        onClose={() => setDetailTarget(null)}
      />
    </Box>
  );
}
