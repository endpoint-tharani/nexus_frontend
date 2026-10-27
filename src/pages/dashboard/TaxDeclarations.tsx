import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Autocomplete,
  Box,
  Button,
  Chip,
  CircularProgress,
  IconButton,
  InputAdornment,
  MenuItem,
  Tab,
  Tabs,
  TextField,
  Tooltip,
} from "@mui/material";
import { MdClose, MdFileDownload, MdRefresh, MdSearch } from "react-icons/md";
import toast from "react-hot-toast";

import {
  ApprovalDialog,
  DeclarationTable,
  PendingDeclarationTable,
  RejectionDialog,
  TaxSummaryCards,
} from "../../components/tax";
import { exportDeclaration, exportTracking } from "../../api/tax.api";
import {
  useCreateDeclaration,
  useTaxDeclarations,
  useTaxSummary,
} from "../../hooks/tax";
import { useEmployees } from "../../hooks/employee";
import { useCompanyId } from "../../hooks/shared/useCompanyId";
import {
  DECLARATION_STATUS_OPTIONS,
  type DeclarationStatus,
} from "../../constants/enums";
import { NOT_STARTED } from "../../types/tax.types";
import type {
  DeclarationFilters,
  TaxDeclaration,
  TaxSummaryGridRow,
} from "../../types";
import {
  downloadXlsx,
  financialYearOptions,
  getErrorMessage,
  getFinancialYear,
} from "../../utils";

const CURRENT_FY = getFinancialYear(new Date());
const FY_OPTIONS = financialYearOptions(CURRENT_FY, 5);

type TabValue = DeclarationStatus | "" | typeof NOT_STARTED;

export default function TaxDeclarations() {
  const companyId = useCompanyId();

  // --- Filters ---
  const [year, setYear] = useState<number>(CURRENT_FY);
  // "" = All, NOT_STARTED = the Pending tab (employees with no declaration yet,
  // served from the summary grid — the list endpoint has no row for them).
  const [status, setStatus] = useState<TabValue>("");
  const [employeeId, setEmployeeId] = useState<string>("");
  // Free-text search runs client-side over the loaded rows (name / code / FY).
  const [search, setSearch] = useState("");

  const isPendingTab = status === NOT_STARTED;

  const filters: DeclarationFilters = {
    ...(status !== "" && status !== NOT_STARTED ? { status } : {}),
    ...(employeeId !== "" ? { employeeId } : {}),
  };

  const hasActiveFilters =
    status !== "" || employeeId !== "" || search.trim() !== "";

  const resetFilters = () => {
    setStatus("");
    setEmployeeId("");
    setSearch("");
  };

  const {
    data: summary,
    isLoading: summaryLoading,
    isError: summaryIsError,
    refetch: refetchSummary,
  } = useTaxSummary(year);
  const {
    data: declarations = [],
    isLoading,
    isError,
    isFetching,
    refetch,
  } = useTaxDeclarations(year, filters);

  // Employee list powers the filter dropdown (single page is plenty for a filter).
  const { data: employees = [] } = useEmployees({ limit: 200 });

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

  // Client-side search over the server-filtered rows + running aggregates for
  // the visible set (so the totals always match what's on screen).
  const filteredDeclarations = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return declarations;
    return declarations.filter((d) =>
      [d.employeeName, d.employeeCode, d.employeeId, String(d.year)]
        .filter(Boolean)
        .some((field) => field!.toLowerCase().includes(q))
    );
  }, [declarations, search]);

  // Employees with no declaration for the year. They exist only in the summary
  // grid, so the same employee + search filters are applied client-side here.
  const pendingRows = useMemo(() => {
    const q = search.trim().toLowerCase();
    return (summary?.grid ?? []).filter((row) => {
      if (row.status !== NOT_STARTED) return false;
      if (employeeId !== "" && row.employeeId !== employeeId) return false;
      if (!q) return true;
      return [row.employeeName, row.employeeCode, row.email]
        .filter(Boolean)
        .some((field) => field!.toLowerCase().includes(q));
    });
  }, [summary, employeeId, search]);

  // Tab counts come from the year summary (independent of the active status
  // filter), so they stay stable as the admin clicks between tabs.
  const statusCounts: Record<string, number> = {
    "": summary
      ? summary.draftCount +
        summary.submittedCount +
        summary.approvedCount +
        summary.rejectedCount
      : 0,
    [NOT_STARTED]: summary?.notStartedCount ?? 0,
    DRAFT: summary?.draftCount ?? 0,
    SUBMITTED: summary?.submittedCount ?? 0,
    APPROVED: summary?.approvedCount ?? 0,
    REJECTED: summary?.rejectedCount ?? 0,
  };

  // --- Dialog state ---
  const navigate = useNavigate();
  const [approveTarget, setApproveTarget] = useState<TaxDeclaration | null>(
    null
  );
  const [rejectTarget, setRejectTarget] = useState<TaxDeclaration | null>(null);

  // --- Exports (direct api + shared download util; local loading state) ---
  const [exportingTracking, setExportingTracking] = useState(false);
  const [exportingId, setExportingId] = useState<string | null>(null);

  // --- Filing on an employee's behalf (Pending tab) ---
  const createDeclaration = useCreateDeclaration();
  const [creatingEmployeeId, setCreatingEmployeeId] = useState<string | null>(
    null
  );

  // Opens the DRAFT declaration, then lands the admin on the detail screen where
  // the entries are actually made.
  const handleCreateDeclaration = async (row: TaxSummaryGridRow) => {
    setCreatingEmployeeId(row.employeeId);
    try {
      const created = await createDeclaration.mutateAsync({
        employeeId: row.employeeId,
        year,
      });
      toast.success(`Declaration opened for ${row.employeeName}.`);
      navigate(`/dashboard/tax/declarations/${created.id}`);
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setCreatingEmployeeId(null);
    }
  };

  const handleRefresh = () => {
    refetch();
    refetchSummary();
  };

  const handleExportTracking = async () => {
    if (!companyId) {
      toast.error("No active company selected.");
      return;
    }
    setExportingTracking(true);
    try {
      const res = await exportTracking(companyId, year);
      downloadXlsx(res.data, `tax-tracking-FY${year}`);
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setExportingTracking(false);
    }
  };

  const handleExportDeclaration = async (declaration: TaxDeclaration) => {
    if (!companyId) {
      toast.error("No active company selected.");
      return;
    }
    setExportingId(declaration.id);
    try {
      const res = await exportDeclaration(companyId, declaration.id);
      const who = declaration.employeeCode ?? declaration.employeeId;
      downloadXlsx(res.data, `tax-declaration-${who}-FY${declaration.year}`);
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setExportingId(null);
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        // Pin to the routed content area (viewport − topbar 64px − page padding
        // 48px) with a FIXED height so the table body scrolls internally and the
        // pagination footer stays put — the page itself never scrolls.
        height: "calc(100dvh - 112px)",
      }}
    >
      {/* Summary cards */}
      <TaxSummaryCards summary={summary} loading={summaryLoading} />

      {/* Status tabs + actions share one toolbar row */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 2,
          flexWrap: "wrap",
          borderBottom: 1,
          borderColor: "divider",
          mb: 1.5,
        }}
      >
        <Tabs
          value={status}
          onChange={(_, value) => setStatus(value as TabValue)}
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            minHeight: 40,
            "& .MuiTab-root": { minHeight: 40, py: 1 },
            "& .MuiTabs-indicator": { bottom: 0 },
          }}
        >
          <Tab value="" label={tabLabel("All", statusCounts[""])} />
          <Tab
            value={NOT_STARTED}
            label={tabLabel("Pending", statusCounts[NOT_STARTED])}
          />
          {DECLARATION_STATUS_OPTIONS.map((option) => (
            <Tab
              key={option.value}
              value={option.value}
              label={tabLabel(option.label, statusCounts[option.value])}
            />
          ))}
        </Tabs>

        <Box
          sx={{ display: "flex", alignItems: "center", gap: 1, pb: 0.5 }}
        >
          <Tooltip title="Refresh">
            <span>
              <IconButton
                size="small"
                aria-label="Refresh declarations"
                onClick={handleRefresh}
                disabled={isFetching}
                sx={{ border: 1, borderColor: "divider", borderRadius: 1.5 }}
              >
                {isFetching ? (
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
            startIcon={
              exportingTracking ? (
                <CircularProgress size={14} color="inherit" />
              ) : (
                <MdFileDownload size={16} />
              )
            }
            onClick={handleExportTracking}
            disabled={exportingTracking}
          >
            Export Tracking
          </Button>
        </Box>
      </Box>

      {/* Filter toolbar */}
      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          gap: 1.5,
          mb: 1.5,
        }}
      >
        <TextField
          size="small"
          placeholder="Search name or employee code…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{ flex: 1, minWidth: 220 }}
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
          value={selectedEmployeeOption}
          onChange={(_, next) => setEmployeeId(next?.id ?? "")}
          isOptionEqualToValue={(o, v) => o.id === v.id}
          sx={{ minWidth: 260 }}
          renderInput={(params) => (
            <TextField {...params} label="Employee" placeholder="Search name or code" />
          )}
        />

        {hasActiveFilters && (
          <Button
            size="small"
            color="inherit"
            startIcon={<MdClose size={16} />}
            onClick={resetFilters}
          >
            Clear
          </Button>
        )}
      </Box>

      

      {/* Declarations table — grows to fill the remaining height */}
      <Box sx={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column" }}>
        {isPendingTab ? (
          <PendingDeclarationTable
            rows={pendingRows}
            year={year}
            loading={summaryLoading}
            error={summaryIsError ? "Failed to load employees." : null}
            onRetry={() => refetchSummary()}
            // The status tab is always set here, so only the employee/search
            // filters decide whether "no rows" means "filtered out".
            hasFilters={employeeId !== "" || search.trim() !== ""}
            creatingEmployeeId={creatingEmployeeId}
            onCreate={handleCreateDeclaration}
          />
        ) : (
          <DeclarationTable
            declarations={filteredDeclarations}
            loading={isLoading}
            error={isError ? "Failed to load declarations." : null}
            onRetry={() => refetch()}
            hasFilters={hasActiveFilters}
            exportingId={exportingId}
            onView={(declaration) => navigate(`/dashboard/tax/declarations/${declaration.id}`)}
            onApprove={(declaration) => setApproveTarget(declaration)}
            onReject={(declaration) => setRejectTarget(declaration)}
            onExport={handleExportDeclaration}
          />
        )}
      </Box>

      {/* Approve */}
      <ApprovalDialog
        open={!!approveTarget}
        declaration={approveTarget}
        onClose={() => setApproveTarget(null)}
      />

      {/* Reject */}
      <RejectionDialog
        open={!!rejectTarget}
        declaration={rejectTarget}
        onClose={() => setRejectTarget(null)}
      />
    </Box>
  );
}

// A tab label with a trailing count pill, e.g. "Submitted  3".
function tabLabel(text: string, count: number) {
  return (
    <Box sx={{ display: "inline-flex", alignItems: "center", gap: 1 }}>
      {text}
      <Chip
        label={count}
        size="small"
        sx={{ height: 20, "& .MuiChip-label": { px: 0.75, fontWeight: 700 } }}
      />
    </Box>
  );
}
