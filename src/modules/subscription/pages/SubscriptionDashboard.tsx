import { useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
  Grid,
  Tabs,
  Tab,
  Typography,
  Chip,
  IconButton,
  Tooltip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import {
  MdWorkspacePremium,
  MdAutorenew,
  MdCancel,
  MdVisibility,
  MdCheckCircle,
} from "react-icons/md";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";

import {
  DataTable,
  PageHeader,
  StatCard,
  StatusChip,
  SearchInput,
} from "../../../components/ui";
import { usePendingCompanies, useSubscriptions } from "../hooks/useSubscriptionAdmin";
import type { Company } from "../../../types/company.types";

// Dialog imports
import ActivateSubscriptionDialog from "../dialogs/ActivateSubscriptionDialog";
import RenewSubscriptionDialog from "../dialogs/RenewSubscriptionDialog";
import CancelSubscriptionDialog from "../dialogs/CancelSubscriptionDialog";

export default function SubscriptionDashboard() {
  const navigate = useNavigate();
  const { data: pendingCompanies = [], isLoading: pendingLoading } = usePendingCompanies();

  // Tabs
  const [tabIndex, setTabIndex] = useState(0);

  // Search filter
  const [search, setSearch] = useState("");

  // Pagination states
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  // Sorting states
  const [sortBy, setSortBy] = useState<string>("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  // Filtering states
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [planFilter, setPlanFilter] = useState<string>("");
  const [moduleFilter, setModuleFilter] = useState<string>("");

  // Reset to first page when filters/search changes
  useEffect(() => {
    setPage(1);
  }, [search, statusFilter, planFilter, moduleFilter]);

  // Fetch subscriptions with server-side parameters
  const { data: subsData, isLoading: subscriptionsLoading } = useSubscriptions({
    page,
    pageSize,
    search: search.trim() || undefined,
    status: statusFilter || undefined,
    plan: planFilter || undefined,
    module: moduleFilter || undefined,
    sortBy,
    sortOrder,
  });

  const subscriptionsResult = subsData?.items ?? [];
  const pagination = subsData?.pagination ?? { page: 1, pageSize: 20, total: 0, totalPages: 1 };
  const summary = subsData?.summary ?? { active: 0, expired: 0, trial: 0, cancelled: 0, suspended: 0, expiringSoon: 0 };

  // Dialog state
  const [activeCompanyForActivation, setActiveCompanyForActivation] = useState<Company | null>(null);
  const [renewTarget, setRenewTarget] = useState<any | null>(null);
  const [cancelTarget, setCancelTarget] = useState<any | null>(null);

  // Calculate top summary stats from the subscriptions list
  const stats = useMemo(() => {
    return {
      active: summary.active,
      expired: summary.expired,
      cancelled: summary.cancelled,
      trial: summary.trial,
      suspended: summary.suspended || 0,
      expiringSoon: summary.expiringSoon || 0,
      pending: pendingCompanies.length,
    };
  }, [summary, pendingCompanies]);

  // Filters
  const filteredSubscriptions = subscriptionsResult;

  const filteredPending = useMemo(() => {
    if (!search.trim()) return pendingCompanies;
    const q = search.toLowerCase();
    return pendingCompanies.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        (c.email && c.email.toLowerCase().includes(q))
    );
  }, [pendingCompanies, search]);

  // DataGrid Column Definitions for Subscriptions
  const subscriptionColumns = useMemo<any[]>(
    () => [
      {
        accessorKey: "name",
        header: "Company",
        cell: ({ row }: any) => (
          <Box>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              {row.original.name}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {row.original.email}
            </Typography>
          </Box>
        ),
      },
      {
        accessorKey: "currentPlan",
        header: "Current Plan",
        cell: ({ row }: any) => row.original.currentPlan || "—",
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }: any) => (
          <StatusChip status={row.original.status} kind="subscription" />
        ),
      },
      {
        accessorKey: "startDate",
        header: "Start Date",
        cell: ({ row }: any) =>
          row.original.startDate ? dayjs(row.original.startDate).format("DD MMM YYYY") : "—",
      },
      {
        accessorKey: "endDate",
        header: "End Date",
        cell: ({ row }: any) =>
          row.original.endDate ? dayjs(row.original.endDate).format("DD MMM YYYY") : "—",
      },
      {
        id: "remainingDays",
        header: "Remaining Days",
        cell: ({ row }: any) => {
          const days = row.original.remainingDays ?? 0;
          return `${days} day${days !== 1 ? "s" : ""}`;
        },
      },
      {
        id: "modules",
        header: "Modules",
        cell: ({ row }: any) => {
          const list = row.original.modules ?? [];
          if (list.length === 0) return <Typography variant="body2" color="text.disabled">—</Typography>;
          return (
            <Tooltip title={list.join(", ")}>
              <Chip
                label={`${list.length} enabled`}
                size="small"
                variant="outlined"
                color="primary"
                sx={{ fontSize: "0.75rem", height: 20 }}
              />
            </Tooltip>
          );
        },
      },
    ],
    []
  );

  // DataGrid Column Definitions for Pending
  const pendingColumns = useMemo<any[]>(
    () => [
      {
        accessorKey: "name",
        header: "Company",
        cell: ({ row }: any) => (
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            {row.original.name}
          </Typography>
        ),
      },
      {
        accessorKey: "email",
        header: "Email",
        cell: ({ row }: any) => row.original.email || "—",
      },
      {
        accessorKey: "createdAt",
        header: "Created",
        cell: ({ row }: any) =>
          row.original.createdAt ? dayjs(row.original.createdAt).format("DD MMM YYYY HH:mm") : "—",
      },
    ],
    []
  );

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3, minHeight: "100%" }}>
      <PageHeader title="Subscription Dashboard" />

      {/* Summary Cards */}
      <Grid container spacing={2}>
        <Grid size={{ xs: 6, sm: 4, md: 1.71 }}>
          <StatCard
            label="Active"
            value={stats.active}
            icon={<MdCheckCircle size={22} />}
            color="success"
          />
        </Grid>
        <Grid size={{ xs: 6, sm: 4, md: 1.71 }}>
          <StatCard
            label="Expiring Soon"
            value={stats.expiringSoon}
            icon={<MdAutorenew size={22} />}
            color="warning"
          />
        </Grid>
        <Grid size={{ xs: 6, sm: 4, md: 1.71 }}>
          <StatCard
            label="Trial"
            value={stats.trial}
            icon={<MdWorkspacePremium size={22} />}
            color="info"
          />
        </Grid>
        <Grid size={{ xs: 6, sm: 4, md: 1.71 }}>
          <StatCard
            label="Pending"
            value={stats.pending}
            icon={<MdAutorenew size={22} />}
            color="warning"
          />
        </Grid>
        <Grid size={{ xs: 6, sm: 4, md: 1.71 }}>
          <StatCard
            label="Suspended"
            value={stats.suspended}
            icon={<MdCancel size={22} />}
            color="warning"
          />
        </Grid>
        <Grid size={{ xs: 6, sm: 4, md: 1.71 }}>
          <StatCard
            label="Expired"
            value={stats.expired}
            icon={<MdCancel size={22} />}
            color="error"
          />
        </Grid>
        <Grid size={{ xs: 6, sm: 4, md: 1.71 }}>
          <StatCard
            label="Cancelled"
            value={stats.cancelled}
            icon={<MdCancel size={22} />}
            color="info"
          />
        </Grid>
      </Grid>

      {/* Tabs and Controls */}
      <Box sx={{ borderBottom: 1, borderColor: "divider", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 2 }}>
        <Tabs value={tabIndex} onChange={(_, idx) => setTabIndex(idx)}>
          <Tab label="All Subscriptions" sx={{ fontWeight: 600, textTransform: "none" }} />
          <Tab
            label={
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                Pending Activations
                <Chip label={stats.pending} size="small" color="warning" sx={{ height: 18, fontSize: "0.7rem", fontWeight: 700 }} />
              </Box>
            }
            sx={{ fontWeight: 600, textTransform: "none" }}
          />
        </Tabs>

        {/* Controls */}
        <Box sx={{ pb: 1, display: "flex", gap: 1.5, flexWrap: "wrap", alignItems: "center", width: { xs: "100%", sm: "auto" } }}>
          {tabIndex === 0 && (
            <>
              {/* Status Filter */}
              <FormControl size="small" sx={{ minWidth: 130 }}>
                <InputLabel id="status-filter-label">Status</InputLabel>
                <Select
                  labelId="status-filter-label"
                  value={statusFilter}
                  label="Status"
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <MenuItem value="">All Statuses</MenuItem>
                  <MenuItem value="ACTIVE">Active</MenuItem>
                  <MenuItem value="TRIAL">Trial</MenuItem>
                  <MenuItem value="EXPIRED">Expired</MenuItem>
                  <MenuItem value="CANCELLED">Cancelled</MenuItem>
                  <MenuItem value="SUSPENDED">Suspended</MenuItem>
                  <MenuItem value="GRACE_PERIOD">Grace Period</MenuItem>
                </Select>
              </FormControl>

              {/* Plan Filter */}
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel id="plan-filter-label">Plan</InputLabel>
                <Select
                  labelId="plan-filter-label"
                  value={planFilter}
                  label="Plan"
                  onChange={(e) => setPlanFilter(e.target.value)}
                >
                  <MenuItem value="">All Plans</MenuItem>
                  <MenuItem value="TDS">TDS Plan</MenuItem>
                  <MenuItem value="FULL_SUITE">Full Suite</MenuItem>
                  <MenuItem value="PAYROLL">Payroll Only</MenuItem>
                  <MenuItem value="ATTENDANCE">Attendance Only</MenuItem>
                </Select>
              </FormControl>

              {/* Module Filter */}
              <FormControl size="small" sx={{ minWidth: 140 }}>
                <InputLabel id="module-filter-label">Module</InputLabel>
                <Select
                  labelId="module-filter-label"
                  value={moduleFilter}
                  label="Module"
                  onChange={(e) => setModuleFilter(e.target.value)}
                >
                  <MenuItem value="">All Modules</MenuItem>
                  <MenuItem value="PAYROLL">Payroll</MenuItem>
                  <MenuItem value="ATTENDANCE">Attendance</MenuItem>
                  <MenuItem value="LEAVE">Leave</MenuItem>
                  <MenuItem value="TAX_DECLARATION">Tax Declaration</MenuItem>
                  <MenuItem value="EMPLOYEE_PORTAL">Employee Portal</MenuItem>
                  <MenuItem value="BIOMETRIC">Biometric</MenuItem>
                  <MenuItem value="COMPLIANCE">Compliance</MenuItem>
                </Select>
              </FormControl>
            </>
          )}

          <SearchInput
            placeholder={tabIndex === 0 ? "Search subscriptions..." : "Search pending companies..."}
            value={search}
            onChange={(val) => setSearch(val)}
          />
        </Box>
      </Box>

      {/* Data tables */}
      <Box sx={{ flexGrow: 1 }}>
        {tabIndex === 0 ? (
          <DataTable
            columns={subscriptionColumns}
            data={filteredSubscriptions}
            loading={subscriptionsLoading}
            getRowId={(row: any) => row.id}
            serverRowCount={pagination.total}
            serverPage={pagination.page - 1}
            serverRowsPerPage={pagination.pageSize}
            onServerPageChange={(newPage) => {
              setPage(newPage + 1);
            }}
            onServerRowsPerPageChange={(newPageSize) => {
              setPageSize(newPageSize);
              setPage(1);
            }}
            serverSortBy={sortBy === "plan" ? "currentPlan" : sortBy}
            serverSortOrder={sortOrder}
            onServerSortChange={(columnId, order) => {
              const sortByMap: Record<string, string> = {
                name: "name",
                currentPlan: "plan",
                startDate: "startDate",
                endDate: "endDate",
                remainingDays: "remainingDays",
              };
              setSortBy(sortByMap[columnId] || "name");
              setSortOrder(order);
            }}
            rowActions={(row: any) => (
              <Box sx={{ display: "flex", gap: 0.5 }}>
                <Tooltip title="View Details">
                  <IconButton
                    size="small"
                    color="primary"
                    onClick={() => navigate(`/dashboard/admin/subscriptions/company/${row.id}`)}
                  >
                    <MdVisibility size={18} />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Renew Plan">
                  <IconButton
                    size="small"
                    color="success"
                    disabled={row.status === "CANCELLED"}
                    onClick={() => setRenewTarget(row)}
                  >
                    <MdAutorenew size={18} />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Cancel Plan">
                  <IconButton
                    size="small"
                    color="error"
                    disabled={row.status === "CANCELLED" || row.status === "EXPIRED"}
                    onClick={() => setCancelTarget(row)}
                  >
                    <MdCancel size={18} />
                  </IconButton>
                </Tooltip>
              </Box>
            )}
            emptyTitle="No subscriptions found"
            emptyDescription="There are no active or expired subscriptions matching your filters."
          />
        ) : (
          <DataTable
            columns={pendingColumns}
            data={filteredPending}
            loading={pendingLoading}
            getRowId={(row: any) => row.id}
            rowActions={(row: any) => (
              <Button
                 variant="contained"
                 size="small"
                 startIcon={<MdWorkspacePremium size={16} />}
                 onClick={() => setActiveCompanyForActivation(row)}
                 sx={{ textTransform: "none" }}
              >
                Activate Plan
              </Button>
            )}
            emptyTitle="No pending activations"
            emptyDescription="All companies have already been provisioned with an active plan."
          />
        )}
      </Box>

      {/* Activation Step Dialog */}
      {activeCompanyForActivation && (
        <ActivateSubscriptionDialog
          open={!!activeCompanyForActivation}
          company={activeCompanyForActivation}
          onClose={() => setActiveCompanyForActivation(null)}
          onSuccess={() => {
            setActiveCompanyForActivation(null);
          }}
        />
      )}

      {/* Renew Subscription Dialog */}
      {renewTarget && (
        <RenewSubscriptionDialog
          open={!!renewTarget}
          companyId={renewTarget.id}
          companyName={renewTarget.name}
          currentPlanCode={renewTarget.planCode || "FULL_SUITE"}
          currentPlanName={renewTarget.currentPlan || "Full Suite"}
          currentExpiryDate={renewTarget.endDate}
          onClose={() => setRenewTarget(null)}
          onSuccess={() => {
            setRenewTarget(null);
          }}
        />
      )}

      {/* Cancel Subscription Dialog */}
      {cancelTarget && (
        <CancelSubscriptionDialog
          open={!!cancelTarget}
          companyId={cancelTarget.id}
          companyName={cancelTarget.name}
          onClose={() => setCancelTarget(null)}
          onSuccess={() => {
            setCancelTarget(null);
          }}
        />
      )}
    </Box>
  );
}
