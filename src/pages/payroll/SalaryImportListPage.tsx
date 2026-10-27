import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  Chip,
  IconButton,
  MenuItem,
  TextField,
  Tooltip,
  Stack,
  Grid,
  Card,
  CardContent,
  Typography,
  Autocomplete,
  Divider,
} from "@mui/material";
import {
  MdUploadFile,
  MdVisibility,
  MdDeleteOutline,
  MdFileDownload,
  MdSave,
  MdEdit,
  MdCancel,
  MdCheckCircle,
} from "react-icons/md";
import type { ColumnDef } from "@tanstack/react-table";
import toast from "react-hot-toast";
import dayjs from "dayjs";

import {
  DataTable,
  StatusChip,
  DateText,
  ConfirmDialog,
} from "../../components/ui";
import { SalaryImportDialog } from "../../components/payroll";
import {
  useSalaryImportHistory,
  useDeleteSalaryImport,
  useGratuityList,
  useCreateOrUpdateGratuity,
  useDeleteGratuity,
  useELEncashmentList,
  useCreateELEncashment,
  useUpdateELEncashment,
  useDeleteELEncashment,
} from "../../hooks/payroll";
import {
  useListPreviousEmployments,
  useCreatePreviousEmploymentAdmin,
  useUpdatePreviousEmploymentAdmin,
  useDeletePreviousEmploymentAdmin,
  useUploadPreviousEmploymentFile,
  useSubmitPreviousEmployment,
} from "../../hooks/tax/usePreviousEmployment";
import { useEmployees } from "../../hooks/employee";
import { downloadSalaryImportTemplate } from "../../api/payroll.api";
import { useCurrentRole } from "../../hooks/user";
import { useCompanyId } from "../../hooks/shared/useCompanyId";
import { CompanyRole } from "../../constants/enums";
import { MONTHS } from "../../constants/app";
import type {
  PayrollRun,
  SalaryImportType,
  SalaryImportFilters,
  GratuityRecord,
  PreviousEmployment,
  ELEncashmentRecord,
} from "../../types";
import { getMonthName, getErrorMessage, downloadXlsx, toNumber, formatNumber } from "../../utils";

const CURRENT_YEAR = new Date().getFullYear();
const YEAR_OPTIONS = Array.from({ length: 8 }, (_, i) => CURRENT_YEAR + 1 - i);
const FY_OPTIONS = Array.from({ length: 5 }, (_, i) => {
  const y = CURRENT_YEAR + 1 - i;
  return { value: y, label: `${y}-${y + 1}` };
});

export default function SalaryImportListPage() {
  const navigate = useNavigate();
  const isOwner = useCurrentRole() === CompanyRole.OWNER;
  const companyId = useCompanyId();

  const [importType, setImportType] = useState<SalaryImportType>("SALARY");

  // --- Bulk Filters ---
  const [year, setYear] = useState<number | "">("");
  const [month, setMonth] = useState<number | "">("");
  const [fyStartYear, setFyStartYear] = useState<number | "">("");
  const [status, setStatus] = useState<string>("");

  const filters = useMemo<SalaryImportFilters>(() => {
    if (importType === "SALARY") {
      return {
        ...(year !== "" ? { year } : {}),
        ...(month !== "" ? { month } : {}),
      };
    } else {
      return {
        ...(fyStartYear !== "" ? { year: fyStartYear } : {}),
      };
    }
  }, [importType, year, month, fyStartYear]);

  // --- Active Employees Lookup ---
  const { data: employees = [], isLoading: loadingEmployees } = useEmployees({ limit: 1000 });
  const activeEmployees = useMemo(() => employees.filter(e => e.status === "ACTIVE"), [employees]);

  // --- Bulk History Queries & Mutations ---
  const { data: history = [], isLoading: loadingHistory, isError: historyError, refetch: refetchHistory } = useSalaryImportHistory(
    importType === "SALARY" || importType === "BONUS" || importType === "INCENTIVE" ? importType : "SALARY",
    filters,
    { enabled: importType === "SALARY" || importType === "BONUS" || importType === "INCENTIVE" }
  );

  const filteredHistory = useMemo(() => {
    if (!status) return history;
    return history.filter((run) => run.status === status);
  }, [history, status]);

  const [uploadOpen, setUploadOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<PayrollRun | null>(null);
  const [downloadingTemplate, setDownloadingTemplate] = useState(false);

  const deleteMutation = useDeleteSalaryImport(importType);

  const handleDeleteBulk = () => {
    if (!deleteTarget) return;
    deleteMutation.mutate(deleteTarget.id, {
      onSuccess: () => {
        toast.success(`${importType} import deleted successfully`);
        setDeleteTarget(null);
      },
      onError: (error) => toast.error(getErrorMessage(error)),
    });
  };

  const handleDownloadTemplate = async () => {
    if (!companyId) {
      toast.error("No active company selected.");
      return;
    }
    setDownloadingTemplate(true);
    try {
      const res = await downloadSalaryImportTemplate(companyId, importType);
      const filename =
        importType === "SALARY"
          ? "salary_template"
          : importType === "BONUS"
          ? "bonus_template"
          : "incentive_template";
      downloadXlsx(res.data, filename);
      toast.success("Template downloaded successfully");
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setDownloadingTemplate(false);
    }
  };

  // --- Gratuity CRUD Form & List state ---
  const { data: gratuityList = [], isLoading: loadingGratuities, refetch: refetchGratuities } = useGratuityList();
  const gratuityMutation = useCreateOrUpdateGratuity();
  const deleteGratuityMutation = useDeleteGratuity();

  const [selectedGratuity, setSelectedGratuity] = useState<GratuityRecord | null>(null);
  const [deleteGratuityTarget, setDeleteGratuityTarget] = useState<string | null>(null);
  const [gratuityForm, setGratuityForm] = useState({
    employeeId: "",
    joiningDate: "",
    leavingDate: "",
    lastDrawnSalary: 0,
    completedService: 0,
    gratuityAmount: 0,
    remarks: "",
  });

  const handleSelectGratuity = (record: GratuityRecord) => {
    setSelectedGratuity(record);
    setGratuityForm({
      employeeId: record.employeeId,
      joiningDate: dayjs(record.joiningDate).format("YYYY-MM-DD"),
      leavingDate: dayjs(record.leavingDate).format("YYYY-MM-DD"),
      lastDrawnSalary: toNumber(record.lastDrawnSalary) ?? 0,
      completedService: record.completedService,
      gratuityAmount: toNumber(record.gratuityAmount) ?? 0,
      remarks: record.remarks || "",
    });
  };

  const handleClearGratuityForm = () => {
    setSelectedGratuity(null);
    setGratuityForm({
      employeeId: "",
      joiningDate: "",
      leavingDate: "",
      lastDrawnSalary: 0,
      completedService: 0,
      gratuityAmount: 0,
      remarks: "",
    });
  };

  const handleSaveGratuity = () => {
    if (!gratuityForm.employeeId) {
      toast.error("Employee is required");
      return;
    }
    if (!gratuityForm.joiningDate || !gratuityForm.leavingDate) {
      toast.error("Joining and leaving dates are required");
      return;
    }
    const payload = {
      ...(selectedGratuity ? { id: selectedGratuity.id } : {}),
      employeeId: gratuityForm.employeeId,
      joiningDate: gratuityForm.joiningDate,
      leavingDate: gratuityForm.leavingDate,
      lastDrawnSalary: gratuityForm.lastDrawnSalary,
      completedService: gratuityForm.completedService,
      gratuityAmount: gratuityForm.gratuityAmount,
      remarks: gratuityForm.remarks || null,
    };

    gratuityMutation.mutate(payload, {
      onSuccess: () => {
        toast.success(selectedGratuity ? "Gratuity record updated" : "Gratuity record saved");
        handleClearGratuityForm();
        refetchGratuities();
      },
      onError: (err) => toast.error(getErrorMessage(err)),
    });
  };

  const handleDeleteGratuity = () => {
    if (!deleteGratuityTarget) return;
    deleteGratuityMutation.mutate(deleteGratuityTarget, {
      onSuccess: () => {
        toast.success("Gratuity record deleted successfully");
        setDeleteGratuityTarget(null);
        handleClearGratuityForm();
        refetchGratuities();
      },
      onError: (err) => toast.error(getErrorMessage(err)),
    });
  };

  // --- Previous Employment CRUD Form & List state ---
  const [prevEmpFilters] = useState({});
  const { data: prevEmpList = [], isLoading: loadingPrevEmps, refetch: refetchPrevEmps } = useListPreviousEmployments(prevEmpFilters);

  const prevEmpCreateMutation = useCreatePreviousEmploymentAdmin();
  const prevEmpUpdateMutation = useUpdatePreviousEmploymentAdmin();
  const prevEmpDeleteMutation = useDeletePreviousEmploymentAdmin();
  const prevEmpSubmitMutation = useSubmitPreviousEmployment();
  const uploadFileMutation = useUploadPreviousEmploymentFile();

  const [selectedPrevEmp, setSelectedPrevEmp] = useState<PreviousEmployment | null>(null);
  const [deletePrevEmpTarget, setDeletePrevEmpTarget] = useState<string | null>(null);
  const [prevEmpForm, setPrevEmpForm] = useState({
    employeeId: "",
    financialYearStart: CURRENT_YEAR,
    employerName: "",
    employerTan: "",
    employerPan: "",
    employmentFrom: "",
    employmentTo: "",
    grossSalary: 0,
    taxableSalary: 0,
    professionalTax: 0,
    tdsDeducted: 0,
    otherIncome: 0,
    remarks: "",
    form16Attachment: "" as string | null,
    salarySlipAttachment: "" as string | null,
  });

  const handleSelectPrevEmp = (record: PreviousEmployment) => {
    setSelectedPrevEmp(record);
    setPrevEmpForm({
      employeeId: record.employeeId || "",
      financialYearStart: record.financialYearStart,
      employerName: record.employerName || "",
      employerTan: record.employerTan || "",
      employerPan: record.employerPan || "",
      employmentFrom: dayjs(record.employmentFrom).format("YYYY-MM-DD"),
      employmentTo: dayjs(record.employmentTo).format("YYYY-MM-DD"),
      grossSalary: toNumber(record.grossSalary) ?? 0,
      taxableSalary: toNumber(record.taxableSalary) ?? 0,
      professionalTax: toNumber(record.professionalTax) ?? 0,
      tdsDeducted: toNumber(record.tdsDeducted) ?? 0,
      otherIncome: toNumber(record.otherIncome) ?? 0,
      remarks: record.remarks || "",
      form16Attachment: record.form16Attachment || null,
      salarySlipAttachment: record.salarySlipAttachment || null,
    });
  };

  const handleClearPrevEmpForm = () => {
    setSelectedPrevEmp(null);
    setPrevEmpForm({
      employeeId: "",
      financialYearStart: CURRENT_YEAR,
      employerName: "",
      employerTan: "",
      employerPan: "",
      employmentFrom: "",
      employmentTo: "",
      grossSalary: 0,
      taxableSalary: 0,
      professionalTax: 0,
      tdsDeducted: 0,
      otherIncome: 0,
      remarks: "",
      form16Attachment: null,
      salarySlipAttachment: null,
    });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: "form16Attachment" | "salarySlipAttachment") => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const res = await uploadFileMutation.mutateAsync(file);
      const key = res.sourceFileKey || res.fileKey || res.key;
      if (key) {
        setPrevEmpForm(prev => ({ ...prev, [field]: key }));
        toast.success("File uploaded successfully");
      }
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const handleSavePrevEmp = (shouldSubmit = false) => {
    if (!prevEmpForm.employeeId) {
      toast.error("Employee is required");
      return;
    }
    if (!prevEmpForm.employerName) {
      toast.error("Employer Name is required");
      return;
    }
    if (!prevEmpForm.employmentFrom || !prevEmpForm.employmentTo) {
      toast.error("Employment dates are required");
      return;
    }

    const dataPayload = {
      employeeId: prevEmpForm.employeeId,
      financialYearStart: prevEmpForm.financialYearStart,
      employerName: prevEmpForm.employerName,
      employerTan: prevEmpForm.employerTan || null,
      employerPan: prevEmpForm.employerPan || null,
      employmentFrom: prevEmpForm.employmentFrom,
      employmentTo: prevEmpForm.employmentTo,
      grossSalary: prevEmpForm.grossSalary,
      taxableSalary: prevEmpForm.taxableSalary,
      professionalTax: prevEmpForm.professionalTax,
      tdsDeducted: prevEmpForm.tdsDeducted,
      otherIncome: prevEmpForm.otherIncome,
      remarks: prevEmpForm.remarks || null,
      form16Attachment: prevEmpForm.form16Attachment || null,
      salarySlipAttachment: prevEmpForm.salarySlipAttachment || null,
    };

    if (selectedPrevEmp) {
      prevEmpUpdateMutation.mutate(
        { id: selectedPrevEmp.id, employeeId: prevEmpForm.employeeId, data: dataPayload },
        {
          onSuccess: async (res) => {
            if (shouldSubmit) {
              await prevEmpSubmitMutation.mutateAsync(res.id);
              toast.success("Previous Employment submitted successfully");
            } else {
              toast.success("Previous Employment updated successfully");
            }
            handleClearPrevEmpForm();
            refetchPrevEmps();
          },
          onError: (err) => toast.error(getErrorMessage(err)),
        }
      );
    } else {
      prevEmpCreateMutation.mutate(dataPayload, {
        onSuccess: async (res) => {
          if (shouldSubmit) {
            await prevEmpSubmitMutation.mutateAsync(res.id);
            toast.success("Previous Employment submitted successfully");
          } else {
            toast.success("Previous Employment saved successfully");
          }
          handleClearPrevEmpForm();
          refetchPrevEmps();
        },
        onError: (err) => toast.error(getErrorMessage(err)),
      });
    }
  };

  const handleDeletePrevEmp = () => {
    if (!deletePrevEmpTarget || !selectedPrevEmp) return;
    prevEmpDeleteMutation.mutate(
      { id: deletePrevEmpTarget, employeeId: selectedPrevEmp.employeeId || "" },
      {
        onSuccess: () => {
          toast.success("Previous Employment deleted successfully");
          setDeletePrevEmpTarget(null);
          handleClearPrevEmpForm();
          refetchPrevEmps();
        },
        onError: (err) => toast.error(getErrorMessage(err)),
      }
    );
  };

  // --- EL Encashment CRUD Form & List state ---
  const { data: elEncashmentList = [], isLoading: loadingELEncashments, refetch: refetchELEncashments } = useELEncashmentList();
  const createELEncashmentMutation = useCreateELEncashment();
  const updateELEncashmentMutation = useUpdateELEncashment();
  const deleteELEncashmentMutation = useDeleteELEncashment();

  const [selectedELEncashment, setSelectedELEncashment] = useState<ELEncashmentRecord | null>(null);
  const [deleteELEncashmentTarget, setDeleteELEncashmentTarget] = useState<string | null>(null);
  const [elEncashmentForm, setELEncashmentForm] = useState({
    employeeId: "",
    financialYear: CURRENT_YEAR,
    retirementDate: "",
    leaveDaysEncashed: 0,
    averageMonthlySalary: "",
    encashmentAmount: 0,
    remarks: "",
  });

  const selectedEmployee = useMemo(() => {
    return activeEmployees.find((e) => e.id === elEncashmentForm.employeeId);
  }, [activeEmployees, elEncashmentForm.employeeId]);

  const computedYearsOfService = useMemo(() => {
    if (!selectedEmployee?.joinDate || !elEncashmentForm.retirementDate) return 0;
    const diff = dayjs(elEncashmentForm.retirementDate).diff(dayjs(selectedEmployee.joinDate), "year", true);
    return Math.max(0, parseFloat(diff.toFixed(1)));
  }, [selectedEmployee, elEncashmentForm.retirementDate]);

  const handleSelectELEncashment = (record: ELEncashmentRecord) => {
    setSelectedELEncashment(record);
    const joinDate = record.employee?.joinDate;
    const computedRetirementDate = joinDate && record.yearsOfService
      ? dayjs(joinDate).add(Number(record.yearsOfService), "year").format("YYYY-MM-DD")
      : "";

    setELEncashmentForm({
      employeeId: record.employeeId,
      financialYear: record.financialYear,
      retirementDate: computedRetirementDate,
      leaveDaysEncashed: toNumber(record.leaveDaysEncashed) ?? 0,
      averageMonthlySalary: record.averageMonthlySalary ? String(toNumber(record.averageMonthlySalary) ?? "") : "",
      encashmentAmount: toNumber(record.encashmentAmount) ?? 0,
      remarks: record.remarks || "",
    });
  };

  const handleClearELEncashmentForm = () => {
    setSelectedELEncashment(null);
    setELEncashmentForm({
      employeeId: "",
      financialYear: CURRENT_YEAR,
      retirementDate: "",
      leaveDaysEncashed: 0,
      averageMonthlySalary: "",
      encashmentAmount: 0,
      remarks: "",
    });
  };

  const handleSaveELEncashment = () => {
    if (!elEncashmentForm.employeeId) {
      toast.error("Employee is required");
      return;
    }
    if (!elEncashmentForm.retirementDate) {
      toast.error("Date of Retirement / Resignation is required");
      return;
    }
    if (!selectedEmployee?.joinDate) {
      toast.error("Employee has no joining date set. Cannot calculate completed years of service.");
      return;
    }
    if (elEncashmentForm.leaveDaysEncashed < 0) {
      toast.error("Leave days encashed cannot be negative");
      return;
    }
    if (elEncashmentForm.encashmentAmount < 0) {
      toast.error("Encashment amount cannot be negative");
      return;
    }

    const avgSalary = elEncashmentForm.averageMonthlySalary.trim() === ""
      ? undefined
      : Number(elEncashmentForm.averageMonthlySalary);

    const payload = {
      employeeId: elEncashmentForm.employeeId,
      financialYear: elEncashmentForm.financialYear,
      leaveDaysEncashed: Number(elEncashmentForm.leaveDaysEncashed),
      averageMonthlySalary: avgSalary,
      yearsOfService: computedYearsOfService,
      encashmentAmount: Number(elEncashmentForm.encashmentAmount),
      remarks: elEncashmentForm.remarks || null,
    };

    if (selectedELEncashment) {
      updateELEncashmentMutation.mutate(
        { id: selectedELEncashment.id, ...payload },
        {
          onSuccess: (data) => {
            toast.success("EL Encashment record updated");
            handleSelectELEncashment(data);
            refetchELEncashments();
          },
          onError: (err) => toast.error(getErrorMessage(err)),
        }
      );
    } else {
      createELEncashmentMutation.mutate(payload, {
        onSuccess: (data) => {
          toast.success("EL Encashment record saved");
          handleSelectELEncashment(data);
          refetchELEncashments();
        },
        onError: (err) => toast.error(getErrorMessage(err)),
      });
    }
  };

  const handleDeleteELEncashment = () => {
    if (!deleteELEncashmentTarget) return;
    deleteELEncashmentMutation.mutate(deleteELEncashmentTarget, {
      onSuccess: () => {
        toast.success("EL Encashment record deleted successfully");
        setDeleteELEncashmentTarget(null);
        handleClearELEncashmentForm();
        refetchELEncashments();
      },
      onError: (err) => toast.error(getErrorMessage(err)),
    });
  };

  // --- Bulk History Table Columns ---
  const columns = useMemo<ColumnDef<PayrollRun>[]>(() => {
    if (importType === "SALARY") {
      return [
        { id: "month", header: "Month", cell: ({ row }) => getMonthName(row.original.month) },
        { accessorKey: "year", header: "Year" },
        {
          id: "uploadType",
          header: "Upload Type",
          cell: () => "Salary",
        },
        {
          id: "salaryType",
          header: "Salary Type",
          cell: ({ row }) => (
            <Chip
              size="small"
              label={row.original.salaryType === "ARREARS" ? "Arrears" : "Regular"}
              color={row.original.salaryType === "ARREARS" ? "warning" : "primary"}
              sx={{ fontWeight: 600 }}
            />
          ),
        },
        {
          id: "entries",
          header: "Entries",
          cell: ({ row }) => row.original.entryCount ?? "—",
        },
        {
          accessorKey: "status",
          header: "Status",
          cell: ({ row }) => <StatusChip kind="payroll" status={row.original.status} />,
        },
        {
          id: "createdAt",
          header: "Created",
          cell: ({ row }) => <DateText value={row.original.createdAt} />,
        },
      ];
    } else {
      return [
        {
          id: "fy",
          header: "Financial Year",
          cell: ({ row }) => `${row.original.year}-${row.original.year + 1}`,
        },
        {
          id: "entries",
          header: "Entries",
          cell: ({ row }) => row.original.entryCount ?? "—",
        },
        {
          accessorKey: "status",
          header: "Status",
          cell: ({ row }) => <StatusChip kind="payroll" status={row.original.status} />,
        },
        {
          id: "createdAt",
          header: "Created",
          cell: ({ row }) => <DateText value={row.original.createdAt} />,
        },
      ];
    }
  }, [importType]);

  const handleTypeChange = (newType: SalaryImportType) => {
    setImportType(newType);
    setYear("");
    setMonth("");
    setFyStartYear("");
    setStatus("");
    handleClearGratuityForm();
    handleClearPrevEmpForm();
    handleClearELEncashmentForm();
  };

  const uploadBtnText =
    importType === "SALARY"
      ? "Upload Salary"
      : importType === "BONUS"
      ? "Upload Bonus"
      : "Upload Incentive";

  const isBulkType = importType === "SALARY" || importType === "BONUS" || importType === "INCENTIVE";

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "calc(100dvh - 112px)",
      }}
    >
        <>
          {/* Selector + Filters Toolbar */}
          <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          flexWrap: "wrap",
          alignItems: { sm: "center" },
          gap: 2,
          mb: 2,
        }}
      >
        <TextField
          select
          label="Upload Type"
          size="small"
          value={importType}
          onChange={(e) => handleTypeChange(e.target.value as SalaryImportType)}
          sx={{ width: { xs: "100%", sm: 220 } }}
        >
          <MenuItem value="SALARY">Salary</MenuItem>
          <MenuItem value="BONUS">Bonus</MenuItem>
          <MenuItem value="INCENTIVE">Incentive</MenuItem>
          <MenuItem value="GRATUITY">Gratuity</MenuItem>
          <MenuItem value="PREVIOUS_EMPLOYMENT">Previous Employment</MenuItem>
          <MenuItem value="EL_ENCASHMENT">EL Encashment</MenuItem>
        </TextField>

        {isBulkType && (
          <>
            {importType === "SALARY" ? (
              <>
                <TextField
                  select
                  label="Year"
                  size="small"
                  value={year}
                  onChange={(e) => setYear(e.target.value === "" ? "" : Number(e.target.value))}
                  sx={{ width: { xs: "100%", sm: 150 } }}
                >
                  <MenuItem value="">All years</MenuItem>
                  {YEAR_OPTIONS.map((y) => (
                    <MenuItem key={y} value={y}>
                      {y}
                    </MenuItem>
                  ))}
                </TextField>

                <TextField
                  select
                  label="Month"
                  size="small"
                  value={month}
                  onChange={(e) => setMonth(e.target.value === "" ? "" : Number(e.target.value))}
                  sx={{ width: { xs: "100%", sm: 150 } }}
                >
                  <MenuItem value="">All months</MenuItem>
                  {MONTHS.map((m) => (
                    <MenuItem key={m.value} value={m.value}>
                      {m.label}
                    </MenuItem>
                  ))}
                </TextField>
              </>
            ) : (
              <TextField
                select
                label="Financial Year"
                size="small"
                value={fyStartYear}
                onChange={(e) => setFyStartYear(e.target.value === "" ? "" : Number(e.target.value))}
                sx={{ width: { xs: "100%", sm: 200 } }}
              >
                <MenuItem value="">All FYs</MenuItem>
                {FY_OPTIONS.map((opt) => (
                  <MenuItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </MenuItem>
                ))}
              </TextField>
            )}

            <TextField
              select
              label="Status"
              size="small"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              sx={{ width: { xs: "100%", sm: 150 } }}
            >
              <MenuItem value="">All statuses</MenuItem>
              <MenuItem value="PROCESSED">Processed</MenuItem>
              <MenuItem value="PROCESSING">Processing</MenuItem>
              <MenuItem value="DRAFT">Draft</MenuItem>
              <MenuItem value="FAILED">Failed</MenuItem>
            </TextField>

            {isOwner && (
              <Stack
                direction="row"
                spacing={1.5}
                sx={{
                  width: { xs: "100%", sm: "auto" },
                  ml: { sm: "auto" },
                }}
              >
                <Button
                  variant="outlined"
                  startIcon={<MdFileDownload size={18} />}
                  onClick={handleDownloadTemplate}
                  disabled={downloadingTemplate}
                >
                  {downloadingTemplate ? "Downloading..." : "Template"}
                </Button>
                <Button
                  variant="contained"
                  startIcon={<MdUploadFile size={18} />}
                  onClick={() => setUploadOpen(true)}
                >
                  {uploadBtnText}
                </Button>
              </Stack>
            )}
          </>
        )}
      </Box>

      {/* Bulk History Table */}
      {isBulkType && (
        <Box sx={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column" }}>
          <DataTable
            columns={columns}
            data={filteredHistory}
            loading={loadingHistory}
            error={historyError ? "Failed to load import history." : null}
            onRetry={() => refetchHistory()}
            fillHeight
            emptyTitle={`No ${importType.toLowerCase()} imports`}
            emptyDescription={
              year !== "" || month !== "" || fyStartYear !== "" || status !== ""
                ? "No runs match the selected filters."
                : isOwner
                ? `Upload your first ${importType.toLowerCase()} file to get started.`
                : undefined
            }
            emptyAction={
              isOwner && year === "" && month === "" && fyStartYear === "" && status === "" ? (
                <Button
                  variant="contained"
                  startIcon={<MdUploadFile size={18} />}
                  onClick={() => setUploadOpen(true)}
                >
                  {uploadBtnText}
                </Button>
              ) : undefined
            }
            ariaLabel="Import history"
            onRowClick={(run) => navigate(`/dashboard/payroll/salary-import/${importType}/${run.id}`)}
            rowActions={(run) => (
              <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                <Tooltip title="View Details">
                  <IconButton
                    size="small"
                    aria-label={`View ${importType.toLowerCase()} details`}
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/dashboard/payroll/salary-import/${importType}/${run.id}`);
                    }}
                  >
                    <MdVisibility size={18} />
                  </IconButton>
                </Tooltip>
                {isOwner && (
                  <Tooltip title="Delete">
                    <IconButton
                      size="small"
                      color="error"
                      aria-label={`Delete ${importType.toLowerCase()} upload`}
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeleteTarget(run);
                      }}
                    >
                      <MdDeleteOutline size={18} />
                    </IconButton>
                  </Tooltip>
                )}
              </Box>
            )}
          />
        </Box>
      )}

      {/* --- Gratuity Single Entry CRUD --- */}
      {importType === "GRATUITY" && (
        <Box sx={{ display: "flex", flex: 1, gap: 3, minHeight: 0, mt: 1, flexDirection: { xs: "column", md: "row" } }}>
          {/* Gratuity Form */}
          <Box sx={{ width: { xs: "100%", md: 400, lg: 440 }, flexShrink: 0, display: "flex", flexDirection: "column" }}>
            <Card variant="outlined" sx={{ height: "100%", overflowY: "auto" }}>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 700 }} gutterBottom>
                  {selectedGratuity ? "Edit Gratuity Record" : "New Gratuity Record"}
                </Typography>
                <Divider sx={{ my: 1.5 }} />
                
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12 }}>
                    <Autocomplete
                      options={activeEmployees}
                      getOptionLabel={(emp) => `${emp.name} (${emp.employeeCode})`}
                      value={activeEmployees.find((e) => e.id === gratuityForm.employeeId) || null}
                      onChange={(_, newValue) =>
                        setGratuityForm((prev) => ({ ...prev, employeeId: newValue?.id || "" }))
                      }
                      disabled={!!selectedGratuity}
                      loading={loadingEmployees}
                      renderInput={(params) => (
                        <TextField {...params} label="Employee" required size="small" />
                      )}
                    />
                  </Grid>

                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      label="Joining Date"
                      required
                      type="date"
                      size="small"
                      fullWidth
                      slotProps={{ inputLabel: { shrink: true } }}
                      value={gratuityForm.joiningDate}
                      onChange={(e) =>
                        setGratuityForm((prev) => ({ ...prev, joiningDate: e.target.value }))
                      }
                    />
                  </Grid>

                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      label="Leaving Date"
                      required
                      type="date"
                      size="small"
                      fullWidth
                      slotProps={{ inputLabel: { shrink: true } }}
                      value={gratuityForm.leavingDate}
                      onChange={(e) =>
                        setGratuityForm((prev) => ({ ...prev, leavingDate: e.target.value }))
                      }
                    />
                  </Grid>

                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      label="Last Drawn Salary"
                      required
                      type="number"
                      size="small"
                      fullWidth
                      value={gratuityForm.lastDrawnSalary}
                      onChange={(e) =>
                        setGratuityForm((prev) => ({
                          ...prev,
                          lastDrawnSalary: Number(e.target.value),
                        }))
                      }
                    />
                  </Grid>

                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      label="Completed Service (Years)"
                      required
                      type="number"
                      size="small"
                      fullWidth
                      slotProps={{ htmlInput: { step: "0.1", min: 0 } }}
                      value={gratuityForm.completedService}
                      onChange={(e) =>
                        setGratuityForm((prev) => ({
                          ...prev,
                          completedService: Number(e.target.value),
                        }))
                      }
                    />
                  </Grid>

                  <Grid size={{ xs: 12 }}>
                    <TextField
                      label="Gratuity Amount"
                      required
                      type="number"
                      size="small"
                      fullWidth
                      value={gratuityForm.gratuityAmount}
                      onChange={(e) =>
                        setGratuityForm((prev) => ({
                          ...prev,
                          gratuityAmount: Number(e.target.value),
                        }))
                      }
                    />
                  </Grid>

                  <Grid size={{ xs: 12 }}>
                    <TextField
                      label="Remarks"
                      size="small"
                      fullWidth
                      multiline
                      rows={2}
                      value={gratuityForm.remarks}
                      onChange={(e) => setGratuityForm((prev) => ({ ...prev, remarks: e.target.value }))}
                    />
                  </Grid>

                  <Grid size={{ xs: 12 }} sx={{ mt: 1 }}>
                    <Stack direction="row" spacing={1.5}>
                      <Button
                        variant="contained"
                        startIcon={<MdSave />}
                        onClick={handleSaveGratuity}
                        fullWidth
                        disabled={gratuityMutation.isPending}
                      >
                        {selectedGratuity ? "Update" : "Save"}
                      </Button>
                      {selectedGratuity && (
                        <Button
                          variant="outlined"
                          color="error"
                          startIcon={<MdDeleteOutline />}
                          onClick={() => setDeleteGratuityTarget(selectedGratuity.id)}
                          disabled={deleteGratuityMutation.isPending}
                        >
                          Delete
                        </Button>
                      )}
                      <Button
                        variant="outlined"
                        color="secondary"
                        startIcon={<MdCancel />}
                        onClick={handleClearGratuityForm}
                      >
                        Clear
                      </Button>
                    </Stack>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Box>

          {/* Gratuity List */}
          <Box sx={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column" }}>
            <Card variant="outlined" sx={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column" }}>
              <Box sx={{ p: 2, borderBottom: "1px solid", borderColor: "divider" }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                  Gratuity Records List
                </Typography>
              </Box>
              <Box sx={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column" }}>
                <DataTable
                  columns={[
                    {
                      id: "empName",
                      header: "Employee",
                      cell: ({ row }) => `${row.original.employee?.name || "—"} (${row.original.employee?.employeeCode || "—"})`,
                    },
                    {
                      id: "joining",
                      header: "Joining Date",
                      cell: ({ row }) => <DateText value={row.original.joiningDate} />,
                    },
                    {
                      id: "leaving",
                      header: "Leaving Date",
                      cell: ({ row }) => <DateText value={row.original.leavingDate} />,
                    },
                    {
                      id: "amount",
                      header: "Gratuity Amount",
                      cell: ({ row }) => `₹${formatNumber(toNumber(row.original.gratuityAmount))}`,
                    },
                    { accessorKey: "remarks", header: "Remarks" },
                  ]}
                  data={gratuityList}
                  loading={loadingGratuities}
                  fillHeight
                  onRowClick={(row) => handleSelectGratuity(row)}
                  rowActions={(row) => (
                    <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                      <Tooltip title="Edit">
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSelectGratuity(row);
                          }}
                        >
                          <MdEdit size={18} />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton
                          size="small"
                          color="error"
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeleteGratuityTarget(row.id);
                          }}
                        >
                          <MdDeleteOutline size={18} />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  )}
                />
              </Box>
            </Card>
          </Box>
        </Box>
      )}

      {/* --- Previous Employment Single Entry CRUD --- */}
      {importType === "PREVIOUS_EMPLOYMENT" && (
        <Box sx={{ display: "flex", flex: 1, gap: 3, minHeight: 0, mt: 1, flexDirection: { xs: "column", md: "row" } }}>
          {/* Previous Employment Form */}
          <Box sx={{ width: { xs: "100%", md: 440, lg: 480 }, flexShrink: 0, display: "flex", flexDirection: "column" }}>
            <Card variant="outlined" sx={{ height: "100%", overflowY: "auto" }}>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 700 }} gutterBottom>
                  {selectedPrevEmp ? "Edit Previous Employment" : "New Previous Employment"}
                </Typography>
                <Divider sx={{ my: 1.5 }} />
                
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12 }}>
                    <Autocomplete
                      options={activeEmployees}
                      getOptionLabel={(emp) => `${emp.name} (${emp.employeeCode})`}
                      value={activeEmployees.find((e) => e.id === prevEmpForm.employeeId) || null}
                      onChange={(_, newValue) =>
                        setPrevEmpForm((prev) => ({ ...prev, employeeId: newValue?.id || "" }))
                      }
                      disabled={!!selectedPrevEmp}
                      loading={loadingEmployees}
                      renderInput={(params) => (
                        <TextField {...params} label="Employee" required size="small" />
                      )}
                    />
                  </Grid>

                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      select
                      label="Financial Year"
                      required
                      size="small"
                      fullWidth
                      value={prevEmpForm.financialYearStart}
                      onChange={(e) =>
                        setPrevEmpForm((prev) => ({
                          ...prev,
                          financialYearStart: Number(e.target.value),
                        }))
                      }
                    >
                      {FY_OPTIONS.map((opt) => (
                        <MenuItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Grid>

                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      label="Employer Name"
                      required
                      size="small"
                      fullWidth
                      value={prevEmpForm.employerName}
                      onChange={(e) =>
                        setPrevEmpForm((prev) => ({ ...prev, employerName: e.target.value }))
                      }
                    />
                  </Grid>

                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      label="Employer TAN"
                      size="small"
                      fullWidth
                      value={prevEmpForm.employerTan}
                      onChange={(e) =>
                        setPrevEmpForm((prev) => ({ ...prev, employerTan: e.target.value }))
                      }
                    />
                  </Grid>

                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      label="Employer PAN"
                      size="small"
                      fullWidth
                      value={prevEmpForm.employerPan}
                      onChange={(e) =>
                        setPrevEmpForm((prev) => ({ ...prev, employerPan: e.target.value }))
                      }
                    />
                  </Grid>

                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      label="Employment From"
                      required
                      type="date"
                      size="small"
                      fullWidth
                      slotProps={{ inputLabel: { shrink: true } }}
                      value={prevEmpForm.employmentFrom}
                      onChange={(e) =>
                        setPrevEmpForm((prev) => ({ ...prev, employmentFrom: e.target.value }))
                      }
                    />
                  </Grid>

                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      label="Employment To"
                      required
                      type="date"
                      size="small"
                      fullWidth
                      slotProps={{ inputLabel: { shrink: true } }}
                      value={prevEmpForm.employmentTo}
                      onChange={(e) =>
                        setPrevEmpForm((prev) => ({ ...prev, employmentTo: e.target.value }))
                      }
                    />
                  </Grid>

                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      label="Gross Salary"
                      required
                      type="number"
                      size="small"
                      fullWidth
                      value={prevEmpForm.grossSalary}
                      onChange={(e) =>
                        setPrevEmpForm((prev) => ({ ...prev, grossSalary: Number(e.target.value) }))
                      }
                    />
                  </Grid>

                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      label="Taxable Salary"
                      required
                      type="number"
                      size="small"
                      fullWidth
                      value={prevEmpForm.taxableSalary}
                      onChange={(e) =>
                        setPrevEmpForm((prev) => ({ ...prev, taxableSalary: Number(e.target.value) }))
                      }
                    />
                  </Grid>

                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      label="Professional Tax"
                      type="number"
                      size="small"
                      fullWidth
                      value={prevEmpForm.professionalTax}
                      onChange={(e) =>
                        setPrevEmpForm((prev) => ({
                          ...prev,
                          professionalTax: Number(e.target.value),
                        }))
                      }
                    />
                  </Grid>

                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      label="TDS Deducted"
                      type="number"
                      size="small"
                      fullWidth
                      value={prevEmpForm.tdsDeducted}
                      onChange={(e) =>
                        setPrevEmpForm((prev) => ({ ...prev, tdsDeducted: Number(e.target.value) }))
                      }
                    />
                  </Grid>

                  <Grid size={{ xs: 12 }}>
                    <TextField
                      label="Other Income"
                      type="number"
                      size="small"
                      fullWidth
                      value={prevEmpForm.otherIncome}
                      onChange={(e) =>
                        setPrevEmpForm((prev) => ({ ...prev, otherIncome: Number(e.target.value) }))
                      }
                    />
                  </Grid>

                  <Grid size={{ xs: 12 }}>
                    <TextField
                      label="Remarks"
                      size="small"
                      fullWidth
                      multiline
                      rows={2}
                      value={prevEmpForm.remarks}
                      onChange={(e) => setPrevEmpForm((prev) => ({ ...prev, remarks: e.target.value }))}
                    />
                  </Grid>

                  {/* Attachment Form 16 */}
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 0.5 }}>
                      Form 16 Attachment
                    </Typography>
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                      <Button
                        variant="outlined"
                        component="label"
                        size="small"
                        fullWidth
                        startIcon={<MdUploadFile />}
                        disabled={uploadFileMutation.isPending}
                      >
                        {uploadFileMutation.isPending ? "Uploading..." : "Upload Form 16"}
                        <input
                          type="file"
                          hidden
                          accept=".pdf,.jpg,.jpeg,.png"
                          onChange={(e) => handleFileUpload(e, "form16Attachment")}
                        />
                      </Button>
                      {prevEmpForm.form16Attachment && (
                        <Typography variant="caption" noWrap color="success.main" align="center">
                          {prevEmpForm.form16Attachment.split("/").pop()}
                        </Typography>
                      )}
                    </Box>
                  </Grid>

                  {/* Attachment Salary Slip */}
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 0.5 }}>
                      Salary Slip Attachment
                    </Typography>
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                      <Button
                        variant="outlined"
                        component="label"
                        size="small"
                        fullWidth
                        startIcon={<MdUploadFile />}
                        disabled={uploadFileMutation.isPending}
                      >
                        {uploadFileMutation.isPending ? "Uploading..." : "Upload Slip"}
                        <input
                          type="file"
                          hidden
                          accept=".pdf,.jpg,.jpeg,.png"
                          onChange={(e) => handleFileUpload(e, "salarySlipAttachment")}
                        />
                      </Button>
                      {prevEmpForm.salarySlipAttachment && (
                        <Typography variant="caption" noWrap color="success.main" align="center">
                          {prevEmpForm.salarySlipAttachment.split("/").pop()}
                        </Typography>
                      )}
                    </Box>
                  </Grid>

                  <Grid size={{ xs: 12 }} sx={{ mt: 1 }}>
                    <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap", gap: 1 }}>
                      <Button
                        variant="contained"
                        startIcon={<MdSave />}
                        onClick={() => handleSavePrevEmp(false)}
                        disabled={prevEmpCreateMutation.isPending || prevEmpUpdateMutation.isPending}
                        size="small"
                        sx={{ flex: 1 }}
                      >
                        {selectedPrevEmp ? "Update" : "Save"}
                      </Button>
                      <Button
                        variant="contained"
                        color="success"
                        startIcon={<MdCheckCircle />}
                        onClick={() => handleSavePrevEmp(true)}
                        disabled={
                          prevEmpCreateMutation.isPending ||
                          prevEmpUpdateMutation.isPending ||
                          prevEmpSubmitMutation.isPending
                        }
                        size="small"
                        sx={{ flex: 1 }}
                      >
                        Submit
                      </Button>
                      {selectedPrevEmp && (
                        <Button
                          variant="outlined"
                          color="error"
                          startIcon={<MdDeleteOutline />}
                          onClick={() => setDeletePrevEmpTarget(selectedPrevEmp.id)}
                          disabled={prevEmpDeleteMutation.isPending}
                          size="small"
                        >
                          Delete
                        </Button>
                      )}
                      <Button
                        variant="outlined"
                        color="secondary"
                        startIcon={<MdCancel />}
                        onClick={handleClearPrevEmpForm}
                        size="small"
                      >
                        Clear
                      </Button>
                    </Stack>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Box>

          {/* Previous Employment List */}
          <Box sx={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column" }}>
            <Card variant="outlined" sx={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column" }}>
              <Box sx={{ p: 2, borderBottom: "1px solid", borderColor: "divider" }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                  Previous Employment List
                </Typography>
              </Box>
              <Box sx={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column" }}>
                <DataTable
                  columns={[
                    {
                      id: "empName",
                      header: "Employee",
                      cell: ({ row }) => `${row.original.employee?.name || "—"} (${row.original.employee?.employeeCode || "—"})`,
                    },
                    { accessorKey: "employerName", header: "Employer" },
                    {
                      id: "fy",
                      header: "Financial Year",
                      cell: ({ row }) => `${row.original.financialYearStart}-${row.original.financialYearStart + 1}`,
                    },
                    {
                      id: "gross",
                      header: "Gross Salary",
                      cell: ({ row }) => `₹${formatNumber(toNumber(row.original.grossSalary))}`,
                    },
                    {
                      accessorKey: "status",
                      header: "Status",
                      cell: ({ row }) => <StatusChip kind="declaration" status={row.original.status} />,
                    },
                  ]}
                  data={prevEmpList}
                  loading={loadingPrevEmps}
                  fillHeight
                  onRowClick={(row) => handleSelectPrevEmp(row)}
                  rowActions={(row) => (
                    <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                      <Tooltip title="Edit">
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSelectPrevEmp(row);
                          }}
                        >
                          <MdEdit size={18} />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton
                          size="small"
                          color="error"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedPrevEmp(row);
                            setDeletePrevEmpTarget(row.id);
                          }}
                        >
                          <MdDeleteOutline size={18} />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  )}
                />
              </Box>
            </Card>
          </Box>
        </Box>
      )}

      {/* --- EL Encashment Single Entry CRUD --- */}
      {importType === "EL_ENCASHMENT" && (
        <Box sx={{ display: "flex", flex: 1, gap: 3, minHeight: 0, mt: 1, flexDirection: { xs: "column", md: "row" } }}>
          {/* EL Encashment Form */}
          <Box sx={{ width: { xs: "100%", md: 440, lg: 480 }, flexShrink: 0, display: "flex", flexDirection: "column" }}>
            <Card variant="outlined" sx={{ height: "100%", overflowY: "auto" }}>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 700 }} gutterBottom>
                  {selectedELEncashment ? "Edit EL Encashment Record" : "New EL Encashment Record"}
                </Typography>
                <Divider sx={{ my: 1.5 }} />
                
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12 }}>
                    <Autocomplete
                      options={activeEmployees}
                      getOptionLabel={(emp) => `${emp.name} (${emp.employeeCode})`}
                      value={activeEmployees.find((e) => e.id === elEncashmentForm.employeeId) || null}
                      onChange={(_, newValue) =>
                        setELEncashmentForm((prev) => ({ ...prev, employeeId: newValue?.id || "" }))
                      }
                      disabled={!!selectedELEncashment}
                      loading={loadingEmployees}
                      renderInput={(params) => (
                        <TextField {...params} label="Employee" required size="small" />
                      )}
                    />
                  </Grid>

                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      select
                      label="Financial Year"
                      required
                      size="small"
                      fullWidth
                      value={elEncashmentForm.financialYear}
                      onChange={(e) =>
                        setELEncashmentForm((prev) => ({
                          ...prev,
                          financialYear: Number(e.target.value),
                        }))
                      }
                    >
                      {FY_OPTIONS.map((opt) => (
                        <MenuItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Grid>

                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      label="Date of Retirement / Resignation"
                      required
                      type="date"
                      size="small"
                      fullWidth
                      slotProps={{ inputLabel: { shrink: true } }}
                      value={elEncashmentForm.retirementDate}
                      onChange={(e) =>
                        setELEncashmentForm((prev) => ({ ...prev, retirementDate: e.target.value }))
                      }
                    />
                  </Grid>

                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      label="EL Days Encashed"
                      required
                      type="number"
                      size="small"
                      fullWidth
                      value={elEncashmentForm.leaveDaysEncashed}
                      onChange={(e) =>
                        setELEncashmentForm((prev) => ({
                          ...prev,
                          leaveDaysEncashed: Number(e.target.value),
                        }))
                      }
                    />
                  </Grid>

                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      label="Average Monthly Salary"
                      type="number"
                      size="small"
                      fullWidth
                      value={elEncashmentForm.averageMonthlySalary}
                      placeholder="Auto-calculated if blank"
                      onChange={(e) =>
                        setELEncashmentForm((prev) => ({
                          ...prev,
                          averageMonthlySalary: e.target.value,
                        }))
                      }
                    />
                  </Grid>

                  <Grid size={{ xs: 12 }}>
                    <TextField
                      label="EL Encashment Amount"
                      required
                      type="number"
                      size="small"
                      fullWidth
                      value={elEncashmentForm.encashmentAmount}
                      onChange={(e) =>
                        setELEncashmentForm((prev) => ({
                          ...prev,
                          encashmentAmount: Number(e.target.value),
                        }))
                      }
                    />
                  </Grid>

                  {selectedELEncashment && (
                    <>
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <TextField
                          label="Exemption Amount"
                          type="number"
                          size="small"
                          fullWidth
                          disabled
                          value={toNumber(selectedELEncashment.exemptAmount)}
                        />
                      </Grid>

                      <Grid size={{ xs: 12, sm: 6 }}>
                        <TextField
                          label="Taxable Amount"
                          type="number"
                          size="small"
                          fullWidth
                          disabled
                          value={toNumber(selectedELEncashment.taxableAmount)}
                        />
                      </Grid>
                    </>
                  )}

                  <Grid size={{ xs: 12 }}>
                    <TextField
                      label="Remarks"
                      size="small"
                      fullWidth
                      multiline
                      rows={2}
                      value={elEncashmentForm.remarks}
                      onChange={(e) => setELEncashmentForm((prev) => ({ ...prev, remarks: e.target.value }))}
                    />
                  </Grid>

                  <Grid size={{ xs: 12 }} sx={{ mt: 1 }}>
                    <Stack direction="row" spacing={1.5}>
                      <Button
                        variant="contained"
                        startIcon={<MdSave />}
                        onClick={handleSaveELEncashment}
                        fullWidth
                        disabled={createELEncashmentMutation.isPending || updateELEncashmentMutation.isPending}
                      >
                        {selectedELEncashment ? "Update" : "Save"}
                      </Button>
                      {selectedELEncashment && (
                        <Button
                          variant="outlined"
                          color="error"
                          startIcon={<MdDeleteOutline />}
                          onClick={() => setDeleteELEncashmentTarget(selectedELEncashment.id)}
                          disabled={deleteELEncashmentMutation.isPending}
                        >
                          Delete
                        </Button>
                      )}
                      <Button
                        variant="outlined"
                        color="secondary"
                        startIcon={<MdCancel />}
                        onClick={handleClearELEncashmentForm}
                      >
                        Reset
                      </Button>
                    </Stack>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Box>

          {/* EL Encashment List */}
          <Box sx={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column" }}>
            <Card variant="outlined" sx={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column" }}>
              <Box sx={{ p: 2, borderBottom: "1px solid", borderColor: "divider" }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                  EL Encashment Records List
                </Typography>
              </Box>
              <Box sx={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column" }}>
                <DataTable
                  columns={[
                    {
                      id: "empName",
                      header: "Employee",
                      cell: ({ row }) => `${row.original.employee?.name || "—"} (${row.original.employee?.employeeCode || "—"})`,
                    },
                    {
                      id: "fy",
                      header: "Financial Year",
                      cell: ({ row }) => `${row.original.financialYear}-${row.original.financialYear + 1}`,
                    },
                    {
                      id: "leaveDays",
                      header: "EL Days",
                      cell: ({ row }) => toNumber(row.original.leaveDaysEncashed),
                    },
                    {
                      id: "avgSalary",
                      header: "Average Monthly Salary",
                      cell: ({ row }) => `₹${formatNumber(toNumber(row.original.averageMonthlySalary))}`,
                    },
                    {
                      id: "amount",
                      header: "EL Encashment Amount",
                      cell: ({ row }) => `₹${formatNumber(toNumber(row.original.encashmentAmount))}`,
                    },
                    {
                      id: "exempt",
                      header: "Exemption Amount",
                      cell: ({ row }) => `₹${formatNumber(toNumber(row.original.exemptAmount))}`,
                    },
                    {
                      id: "taxable",
                      header: "Taxable Amount",
                      cell: ({ row }) => `₹${formatNumber(toNumber(row.original.taxableAmount))}`,
                    },
                    {
                      id: "createdAt",
                      header: "Created Date",
                      cell: ({ row }) => <DateText value={row.original.createdAt} />,
                    },
                  ]}
                  data={elEncashmentList}
                  loading={loadingELEncashments}
                  fillHeight
                  onRowClick={(row) => handleSelectELEncashment(row)}
                  rowActions={(row) => (
                    <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                      <Tooltip title="Edit">
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSelectELEncashment(row);
                          }}
                        >
                          <MdEdit size={18} />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton
                          size="small"
                          color="error"
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeleteELEncashmentTarget(row.id);
                          }}
                        >
                          <MdDeleteOutline size={18} />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  )}
                />
              </Box>
            </Card>
          </Box>
        </Box>
      )}
        </>


      {/* Unified Bulk Import Dialog */}
      {isOwner && isBulkType && (
        <SalaryImportDialog
          open={uploadOpen}
          onClose={() => setUploadOpen(false)}
          type={importType}
        />
      )}



      {/* Bulk Delete Confirm */}
      <ConfirmDialog
        open={!!deleteTarget}
        title={`Delete ${importType.toLowerCase()} upload`}
        message={
          deleteTarget ? (
            <>
              Delete this <strong>{importType.toLowerCase()}</strong> import and all of its associated entries? This action cannot be undone.
            </>
          ) : undefined
        }
        confirmLabel="Delete"
        loading={deleteMutation.isPending}
        onConfirm={handleDeleteBulk}
        onClose={() => {
          if (!deleteMutation.isPending) setDeleteTarget(null);
        }}
      />

      {/* CRUD Delete Confirm Dialogs */}
      <ConfirmDialog
        open={!!deleteGratuityTarget}
        title="Delete Gratuity record"
        message="Are you sure you want to delete this Gratuity record? This action cannot be undone."
        confirmLabel="Delete"
        loading={deleteGratuityMutation.isPending}
        onConfirm={handleDeleteGratuity}
        onClose={() => setDeleteGratuityTarget(null)}
      />

      <ConfirmDialog
        open={!!deletePrevEmpTarget}
        title="Delete Previous Employment"
        message="Are you sure you want to delete this previous employment record? This action cannot be undone."
        confirmLabel="Delete"
        loading={prevEmpDeleteMutation.isPending}
        onConfirm={handleDeletePrevEmp}
        onClose={() => setDeletePrevEmpTarget(null)}
      />

      <ConfirmDialog
        open={!!deleteELEncashmentTarget}
        title="Delete EL Encashment record"
        message="Are you sure you want to delete this EL Encashment record? This action cannot be undone."
        confirmLabel="Delete"
        loading={deleteELEncashmentMutation.isPending}
        onConfirm={handleDeleteELEncashment}
        onClose={() => setDeleteELEncashmentTarget(null)}
      />
    </Box>
  );
}
