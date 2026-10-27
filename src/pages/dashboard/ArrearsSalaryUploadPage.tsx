import { useMemo, useState } from "react";
import {
  Box,
  Button,
  Card,
  IconButton,
  MenuItem,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import { MdDeleteOutline, MdUploadFile } from "react-icons/md";
import type { ColumnDef } from "@tanstack/react-table";
import toast from "react-hot-toast";

import {
  DataTable,
  DateText,
  ConfirmDialog,
} from "../../components/ui";
import AppPage from "../../components/ui/AppPage";
import PageHeader from "../../components/ui/PageHeader";
import { ArrearsUploadDialog } from "../../components/payroll";
import {
  useArrearsHistory,
  useDeleteArrear,
} from "../../hooks/payroll/useArrearsUpload";
import { useCurrentRole } from "../../hooks/user";

import { CompanyRole } from "../../constants/enums";
import { MONTHS } from "../../constants/app";
import type { SalaryArrearRecord } from "../../types";
import { getMonthName, getErrorMessage, toNumber, formatNumber } from "../../utils";

const CURRENT_YEAR = new Date().getFullYear();
const YEAR_OPTIONS = Array.from({ length: 8 }, (_, i) => CURRENT_YEAR + 1 - i);

export default function ArrearsSalaryUploadPage() {
  const isOwner = useCurrentRole() === CompanyRole.OWNER;

  // --- Filters ---
  const [year, setYear] = useState<number | "">("");
  const [month, setMonth] = useState<number | "">("");
  const [search, setSearch] = useState<string>("");

  const filters = useMemo(() => {
    return {
      ...(year !== "" ? { year } : {}),
      ...(month !== "" ? { month } : {}),
    };
  }, [year, month]);

  // --- Queries & Mutations ---
  const {
    data: history = [],
    isLoading: loadingHistory,
    isError: historyError,
    refetch: refetchHistory,
  } = useArrearsHistory(filters);

  const deleteMutation = useDeleteArrear();

  const [uploadOpen, setUploadOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<SalaryArrearRecord | null>(null);

  const handleDelete = () => {
    if (!deleteTarget) return;
    deleteMutation.mutate(deleteTarget.id, {
      onSuccess: () => {
        toast.success("Arrear record deleted successfully");
        setDeleteTarget(null);
      },
      onError: (error) => toast.error(getErrorMessage(error)),
    });
  };

  const filteredHistory = useMemo(() => {
    if (!search.trim()) return history;
    const query = search.toLowerCase();
    return history.filter(
      (item) =>
        item.employee?.name?.toLowerCase().includes(query) ||
        item.employee?.employeeCode?.toLowerCase().includes(query)
    );
  }, [history, search]);

  const columns = useMemo<ColumnDef<SalaryArrearRecord>[]>(() => {
    return [
      {
        id: "employee",
        header: "Employee",
        cell: ({ row }) => (
          <Box>
            <Typography variant="body2" sx={{ fontWeight: 500 }}>
              {row.original.employee?.name || "—"}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {row.original.employee?.employeeCode || "—"}
            </Typography>
          </Box>
        ),
      },
      {
        id: "period",
        header: "Payroll Month",
        cell: ({ row }) => `${getMonthName(row.original.month)} ${row.original.year}`,
      },
      {
        id: "amount",
        header: "Arrear Amount",
        cell: ({ row }) => `₹${formatNumber(toNumber(row.original.amount))}`,
      },
      {
        id: "uploadedBy",
        header: "Uploaded By",
        cell: ({ row }) => row.original.uploadedBy?.name || "—",
      },
      {
        id: "createdAt",
        header: "Uploaded Date",
        cell: ({ row }) => <DateText value={row.original.createdAt} />,
      },
    ];
  }, []);

  return (
    <AppPage>
      <PageHeader
        title="Arrears Salary Upload"
        subtitle="Manage arrears ledger records which adjust employees' annual salary declaration."
        breadcrumbs={[
          { label: "Payroll", href: "/dashboard/payroll/salary-import" },
          { label: "Arrears Salary Upload" },
        ]}
        actions={
          isOwner && (
            <Button
              variant="contained"
              startIcon={<MdUploadFile size={18} />}
              onClick={() => setUploadOpen(true)}
            >
              Upload Arrears
            </Button>
          )
        }
      />

      {/* Filters Card */}
      <Card variant="outlined" sx={{ p: 2 }}>
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            alignItems: { xs: "stretch", sm: "center" },
            gap: 2,
          }}
        >
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

          <TextField
            label="Search Employee"
            size="small"
            placeholder="Search by name or code..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            sx={{ flexGrow: 1 }}
          />
        </Box>
      </Card>

      {/* Arrears List Table */}
      <Box sx={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column" }}>
        <DataTable
          columns={columns}
          data={filteredHistory}
          loading={loadingHistory}
          error={historyError ? "Failed to load arrears history." : null}
          onRetry={() => refetchHistory()}
          fillHeight
          emptyTitle="No arrears records found"
          emptyDescription={
            year !== "" || month !== "" || search !== ""
              ? "No records match the selected filters."
              : isOwner
              ? "Upload an arrears spreadsheet to get started."
              : undefined
          }
          emptyAction={
            isOwner && year === "" && month === "" && search === "" ? (
              <Button
                variant="contained"
                startIcon={<MdUploadFile size={18} />}
                onClick={() => setUploadOpen(true)}
              >
                Upload Arrears
              </Button>
            ) : undefined
          }
          ariaLabel="Arrears records list"
          rowActions={
            isOwner
              ? (row) => (
                  <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                    <Tooltip title="Delete">
                      <IconButton
                        size="small"
                        color="error"
                        aria-label="Delete arrear record"
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeleteTarget(row);
                        }}
                      >
                        <MdDeleteOutline size={18} />
                      </IconButton>
                    </Tooltip>
                  </Box>
                )
              : undefined
          }
        />
      </Box>

      {/* Arrears Upload Dialog */}
      {isOwner && (
        <ArrearsUploadDialog
          open={uploadOpen}
          onClose={() => setUploadOpen(false)}
        />
      )}

      {/* Bulk Delete Confirm */}
      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete Arrear Record"
        message={
          deleteTarget ? (
            <>
              Are you sure you want to delete this arrear record of{" "}
              <strong>₹{formatNumber(toNumber(deleteTarget.amount))}</strong> for{" "}
              <strong>{deleteTarget.employee?.name || "Employee"}</strong> (
              {getMonthName(deleteTarget.month)} {deleteTarget.year})? This action will
              re-sync the employee's tax declaration and cannot be undone.
            </>
          ) : undefined
        }
        confirmLabel="Delete"
        loading={deleteMutation.isPending}
        onConfirm={handleDelete}
        onClose={() => {
          if (!deleteMutation.isPending) setDeleteTarget(null);
        }}
      />
    </AppPage>
  );
}
