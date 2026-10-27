import { useState, useMemo } from "react";
import {
  Box,
  Button,
  Grid,
  Typography,
  Chip,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Divider,
  Breadcrumbs,
  Link,
  CircularProgress,
  Tabs,
  Tab,
} from "@mui/material";
import {
  MdChevronRight,
  MdCheckCircle,
  MdCancel,
  MdAutorenew,
} from "react-icons/md";
import { useParams, Link as RouterLink } from "react-router-dom";
import dayjs from "dayjs";
import toast from "react-hot-toast";

import { PageHeader, SectionCard, StatusChip } from "../../../components/ui";
import {
  useCompanySubscription,
  useReactivateSubscription,
} from "../hooks/useSubscriptionAdmin";
import { getErrorMessage } from "../../../utils";

// Dialog imports
import RenewSubscriptionDialog from "../dialogs/RenewSubscriptionDialog";
import CancelSubscriptionDialog from "../dialogs/CancelSubscriptionDialog";
import ChangePlanDialog from "../dialogs/ChangePlanDialog";
import SuspendSubscriptionDialog from "../dialogs/SuspendSubscriptionDialog";

// Module list
const ALL_MODULES = [
  { code: "PAYROLL", label: "Payroll" },
  { code: "ATTENDANCE", label: "Attendance" },
  { code: "LEAVE", label: "Leave" },
  { code: "TAX_DECLARATION", label: "Tax" },
  { code: "EMPLOYEE_PORTAL", label: "ESS" },
  { code: "BIOMETRIC", label: "Biometric" },
  { code: "COMPLIANCE", label: "Compliance" },
];

export default function CompanySubscriptionDetails() {
  const { companyId } = useParams<{ companyId: string }>();
  const { data: realData, isLoading: queryLoading } = useCompanySubscription(companyId || "");
  const reactivateMutation = useReactivateSubscription();

  // Tab state
  const [historyTab, setHistoryTab] = useState(0);

  // Dialog states
  const [renewOpen, setRenewOpen] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [changePlanOpen, setChangePlanOpen] = useState(false);
  const [suspendOpen, setSuspendOpen] = useState(false);

  const handleReactivate = () => {
    reactivateMutation.mutate(
      { companyId: companyId || "" },
      {
        onSuccess: () => {
          toast.success("Subscription reactivated successfully");
        },
        onError: (err) => {
          toast.error(getErrorMessage(err));
        },
      }
    );
  };

  // Combined data structure resolving either real database records or simulated ones
  const resolvedData = useMemo(() => {
    if (realData) {
      return {
        company: realData.company,
        subscription: realData.subscription,
        modules: realData.modules,
        capabilities: realData.capabilities,
        auditHistory: realData.auditHistory,
        isMock: false,
      };
    }

    return null;
  }, [realData]);

  if (queryLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "calc(100vh - 200px)" }}>
        <CircularProgress />
      </Box>
    );
  }

  // Handle case where company is not found
  if (!resolvedData) {
    return (
      <Box sx={{ p: 3, textAlign: "center" }}>
        <Typography variant="h6" color="error" gutterBottom>
          Company Not Found
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          The subscription record for Company ID "{companyId}" could not be retrieved from the server.
        </Typography>
        <Button variant="outlined" component={RouterLink} to="/admin/subscriptions">
          Back to Dashboard
        </Button>
      </Box>
    );
  }

  const { company, subscription, modules, capabilities, auditHistory } = resolvedData;

  const start = subscription?.startDate ? dayjs(subscription.startDate) : null;
  const end = subscription?.endDate ? dayjs(subscription.endDate) : null;
  const remainingDays = end && subscription?.status !== "CANCELLED" && subscription?.status !== "EXPIRED"
    ? end.diff(dayjs(), "day")
    : 0;

  const timelineItems = [
    {
      title: "Activated",
      date: start ? start.format("DD MMM YYYY") : "—",
      description: `Provisioned with plan: ${subscription?.plan?.name || "—"}`,
      color: "success.main",
    },
    ...(subscription?.status === "CANCELLED"
      ? [
          {
            title: "Cancelled",
            date: end ? end.format("DD MMM YYYY") : "—",
            description: "Subscription manually cancelled by Super Admin",
            color: "error.main",
          },
        ]
      : []),
    ...(subscription?.status === "EXPIRED" || (end && end.isBefore(dayjs()) && subscription?.status !== "CANCELLED")
      ? [
          {
            title: "Expired",
            date: end ? end.format("DD MMM YYYY") : "—",
            description: "Subscription validity period elapsed",
            color: "error.main",
          },
        ]
      : []),
  ];

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      {/* Breadcrumbs Navigation */}
      <Breadcrumbs separator={<MdChevronRight />} aria-label="breadcrumb">
        <Link component={RouterLink} to="/dashboard/admin/subscriptions" underline="hover" color="inherit">
          Subscriptions
        </Link>
        <Typography color="text.primary">{company.name}</Typography>
      </Breadcrumbs>

      <PageHeader
        title={company.name}
        subtitle={`System ID: ${company.id}`}
        actions={
          <Box sx={{ display: "flex", gap: 1.5 }}>
            {subscription?.status === "SUSPENDED" ? (
              <Button
                variant="contained"
                color="info"
                disabled={reactivateMutation.isPending}
                onClick={handleReactivate}
              >
                Reactivate
              </Button>
            ) : (
              <Button
                variant="outlined"
                color="warning"
                disabled={subscription?.status === "CANCELLED" || subscription?.status === "EXPIRED"}
                onClick={() => setSuspendOpen(true)}
              >
                Suspend
              </Button>
            )}
            <Button
              variant="outlined"
              color="primary"
              disabled={subscription?.status === "CANCELLED"}
              onClick={() => setChangePlanOpen(true)}
            >
              Change Plan
            </Button>
            <Button
              variant="contained"
              color="success"
              startIcon={<MdAutorenew />}
              disabled={subscription?.status === "CANCELLED"}
              onClick={() => setRenewOpen(true)}
            >
              Renew
            </Button>
            <Button
              variant="outlined"
              color="error"
              startIcon={<MdCancel />}
              disabled={subscription?.status === "CANCELLED" || subscription?.status === "EXPIRED"}
              onClick={() => setCancelOpen(true)}
            >
              Cancel
            </Button>
          </Box>
        }
      />

      <Grid container spacing={3}>
        {/* Company Summary Card */}
        <Grid size={{ xs: 12, md: 7 }}>
          <SectionCard title="Subscription Details" subtitle="Plan information and dates">
            <Grid container spacing={2}>
              <Grid size={{ xs: 6, sm: 4 }}>
                <Typography variant="caption" color="text.secondary" sx={{ display: "block" }}>
                  Current Plan
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 700, mt: 0.5 }}>
                  {subscription?.plan?.name || "None / Inactive"}
                </Typography>
              </Grid>
              <Grid size={{ xs: 6, sm: 4 }}>
                <Typography variant="caption" color="text.secondary" sx={{ display: "block" }}>
                  Status
                </Typography>
                <Box sx={{ mt: 0.5 }}>
                  <StatusChip status={subscription?.status ?? "EXPIRED"} kind="subscription" />
                </Box>
              </Grid>
              <Grid size={{ xs: 6, sm: 4 }}>
                <Typography variant="caption" color="text.secondary" sx={{ display: "block" }}>
                  Remaining Days
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 700, mt: 0.5 }}>
                  {remainingDays > 0 ? `${remainingDays} day${remainingDays !== 1 ? "s" : ""}` : "0 days"}
                </Typography>
              </Grid>
              <Grid size={{ xs: 12 }}>
                <Divider sx={{ my: 1 }} />
              </Grid>
              <Grid size={{ xs: 6 }}>
                <Typography variant="caption" color="text.secondary" sx={{ display: "block" }}>
                  Start Date
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 600, mt: 0.5 }}>
                  {start ? start.format("DD MMMM YYYY") : "—"}
                </Typography>
              </Grid>
              <Grid size={{ xs: 6 }}>
                <Typography variant="caption" color="text.secondary" sx={{ display: "block" }}>
                  End Date
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 600, mt: 0.5 }}>
                  {end ? end.format("DD MMMM YYYY") : "—"}
                </Typography>
              </Grid>
              <Grid size={{ xs: 12 }}>
                <Divider sx={{ my: 1 }} />
              </Grid>
              <Grid size={{ xs: 6 }}>
                <Typography variant="caption" color="text.secondary" sx={{ display: "block" }}>
                  Company Email
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 600, mt: 0.5 }}>
                  {company.email || "—"}
                </Typography>
              </Grid>
              <Grid size={{ xs: 6 }}>
                <Typography variant="caption" color="text.secondary" sx={{ display: "block" }}>
                  Provisioning Mode
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 600, mt: 0.5 }}>
                  Manual Administration
                </Typography>
              </Grid>
            </Grid>
          </SectionCard>
        </Grid>

        {/* Modules Enabled Card */}
        <Grid size={{ xs: 12, md: 5 }}>
          <SectionCard title="Module Status" subtitle="Capabilities provisioned in plan">
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
              {ALL_MODULES.map((item) => {
                const isEnabled = modules.includes(item.code as any);
                return (
                  <Box
                    key={item.code}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      px: 2,
                      py: 1.25,
                      borderRadius: 1.5,
                      bgcolor: isEnabled ? "rgba(76, 175, 80, 0.04)" : "action.hover",
                      border: "1px solid",
                      borderColor: isEnabled ? "rgba(76, 175, 80, 0.12)" : "divider",
                    }}
                  >
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {item.label}
                    </Typography>
                    <Chip
                      label={isEnabled ? "Enabled" : "Disabled"}
                      size="small"
                      color={isEnabled ? "success" : "default"}
                      sx={{ fontSize: "0.75rem", height: 20 }}
                    />
                  </Box>
                );
              })}
            </Box>
          </SectionCard>
        </Grid>

        {/* Capabilities Card */}
        <Grid size={{ xs: 12, md: 6 }}>
          <SectionCard title="Platform Capabilities" subtitle="Automated workflows active">
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Card variant="outlined" sx={{ borderStyle: "dashed" }}>
                  <CardContent sx={{ p: 2, "&:last-child": { pb: 2 }, display: "flex", alignItems: "center", gap: 1.5 }}>
                    <Box sx={{ color: capabilities.attendanceDrivesPayroll ? "success.main" : "text.disabled", display: "flex" }}>
                      {capabilities.attendanceDrivesPayroll ? <MdCheckCircle size={22} /> : <MdCancel size={22} />}
                    </Box>
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        Attendance Drives Payroll
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Punches calculate LOP
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <Card variant="outlined" sx={{ borderStyle: "dashed" }}>
                  <CardContent sx={{ p: 2, "&:last-child": { pb: 2 }, display: "flex", alignItems: "center", gap: 1.5 }}>
                    <Box sx={{ color: capabilities.leaveDrivesAttendance ? "success.main" : "text.disabled", display: "flex" }}>
                      {capabilities.leaveDrivesAttendance ? <MdCheckCircle size={22} /> : <MdCancel size={22} />}
                    </Box>
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        Leave Drives Attendance
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Approved leaves sync logs
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <Card variant="outlined" sx={{ borderStyle: "dashed" }}>
                  <CardContent sx={{ p: 2, "&:last-child": { pb: 2 }, display: "flex", alignItems: "center", gap: 1.5 }}>
                    <Box sx={{ color: capabilities.lopAuto ? "success.main" : "text.disabled", display: "flex" }}>
                      {capabilities.lopAuto ? <MdCheckCircle size={22} /> : <MdCancel size={22} />}
                    </Box>
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        LOP Auto-Deductions
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        LOP applies to salary run
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <Card variant="outlined" sx={{ borderStyle: "dashed" }}>
                  <CardContent sx={{ p: 2, "&:last-child": { pb: 2 }, display: "flex", alignItems: "center", gap: 1.5 }}>
                    <Box sx={{ color: capabilities.biometricIntegration ? "success.main" : "text.disabled", display: "flex" }}>
                      {capabilities.biometricIntegration ? <MdCheckCircle size={22} /> : <MdCancel size={22} />}
                    </Box>
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        Biometric Integration
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        HW Device API enabled
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </SectionCard>
        </Grid>

        {/* Subscription History Timeline */}
        <Grid size={{ xs: 12, md: 6 }}>
          <SectionCard title="Lifecycle Timeline" subtitle="Subscription status transition events">
            <Box sx={{ position: "relative", pl: 4, ml: 1, borderLeft: "2px solid", borderColor: "divider", display: "flex", flexDirection: "column", gap: 3.5, py: 1 }}>
              {timelineItems.map((item, index) => (
                <Box key={index} sx={{ position: "relative" }}>
                  {/* Dot */}
                  <Box
                    sx={{
                      position: "absolute",
                      left: -41,
                      top: 2,
                      width: 16,
                      height: 16,
                      borderRadius: "50%",
                      bgcolor: item.color,
                      border: "4px solid",
                      borderColor: "background.paper",
                      boxShadow: "0 0 0 2px rgba(0,0,0,0.03)",
                    }}
                  />
                  {/* Content */}
                  <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                      {item.title}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 0.5 }}>
                      {item.date}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {item.description}
                    </Typography>
                  </Box>
                </Box>
              ))}
            </Box>
          </SectionCard>
        </Grid>

        {/* Tabbed Audit / Payments / Renewal logs */}
        <Grid size={{ xs: 12 }}>
          <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 2 }}>
            <Tabs value={historyTab} onChange={(_, val) => setHistoryTab(val)}>
              <Tab label="Subscription Audit Logs" sx={{ fontWeight: 600, textTransform: "none" }} />
              <Tab label="Payment Records" sx={{ fontWeight: 600, textTransform: "none" }} />
              <Tab label="Renewal History" sx={{ fontWeight: 600, textTransform: "none" }} />
            </Tabs>
          </Box>

          {historyTab === 0 && (
            <SectionCard
              title="Subscription Audit Logs"
              subtitle="Manual configuration log of plan changes"
              disableContentPadding
            >
              <TableContainer component={Paper} variant="outlined" sx={{ border: "none" }}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600 }}>Action</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>User</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Timestamp</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Payment Mode</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Reference</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Notes</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {auditHistory.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} align="center" sx={{ py: 3, color: "text.secondary" }}>
                          No audit logs available for this subscription.
                        </TableCell>
                      </TableRow>
                    ) : (
                      auditHistory.map((log) => (
                        <TableRow key={log.id} hover>
                          <TableCell>
                            <Chip
                              label={log.action}
                              size="small"
                              color={log.action === "ACTIVATE" ? "primary" : log.action === "RENEW" ? "success" : log.action === "SUSPEND" ? "warning" : "error"}
                              variant="outlined"
                              sx={{ fontWeight: 700, fontSize: "0.7rem", height: 18 }}
                            />
                          </TableCell>
                          <TableCell>{log.user?.name || log.userId}</TableCell>
                          <TableCell>{dayjs(log.createdAt).format("DD MMM YYYY HH:mm:ss")}</TableCell>
                          <TableCell>{log.newValue?.paymentMode || "—"}</TableCell>
                          <TableCell>{log.newValue?.paymentReference || "—"}</TableCell>
                          <TableCell>{log.newValue?.notes || "—"}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </SectionCard>
          )}

          {historyTab === 1 && (
            <SectionCard
              title="Payment Records"
              subtitle="Transaction records verified by Super Admin"
              disableContentPadding
            >
              <TableContainer component={Paper} variant="outlined" sx={{ border: "none" }}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600 }}>Action</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Amount</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Mode</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Reference</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Invoice Number</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Notes</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Date</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {!realData?.paymentHistory || realData.paymentHistory.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} align="center" sx={{ py: 3, color: "text.secondary" }}>
                          No payment records available.
                        </TableCell>
                      </TableRow>
                    ) : (
                      realData.paymentHistory.map((payment: any) => (
                        <TableRow key={payment.id} hover>
                          <TableCell>
                            <Chip
                              label={payment.action}
                              size="small"
                              color={payment.action === "ACTIVATE" ? "primary" : "success"}
                              sx={{ fontWeight: 600, fontSize: "0.7rem", height: 18 }}
                            />
                          </TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>₹{payment.amount}</TableCell>
                          <TableCell>{payment.paymentMode}</TableCell>
                          <TableCell>{payment.paymentReference}</TableCell>
                          <TableCell>{payment.invoiceNumber || "—"}</TableCell>
                          <TableCell>{payment.notes || "—"}</TableCell>
                          <TableCell>{dayjs(payment.createdAt).format("DD MMM YYYY")}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </SectionCard>
          )}

          {historyTab === 2 && (
            <SectionCard
              title="Renewal History"
              subtitle="Logs of renewal/reactivation operations"
              disableContentPadding
            >
              <TableContainer component={Paper} variant="outlined" sx={{ border: "none" }}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600 }}>Duration</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Previous Expiry</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>New Expiry</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Processed Date</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {!realData?.renewalHistory || realData.renewalHistory.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} align="center" sx={{ py: 3, color: "text.secondary" }}>
                          No renewal logs available.
                        </TableCell>
                      </TableRow>
                    ) : (
                      realData.renewalHistory.map((renewal: any) => (
                        <TableRow key={renewal.id} hover>
                          <TableCell sx={{ fontWeight: 600 }}>{renewal.durationMonths} Months</TableCell>
                          <TableCell>{renewal.oldEndDate ? dayjs(renewal.oldEndDate).format("DD MMM YYYY") : "—"}</TableCell>
                          <TableCell>{renewal.newEndDate ? dayjs(renewal.newEndDate).format("DD MMM YYYY") : "—"}</TableCell>
                          <TableCell>{dayjs(renewal.createdAt).format("DD MMM YYYY HH:mm:ss")}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </SectionCard>
          )}
        </Grid>
      </Grid>

      {/* Renew dialog */}
      {renewOpen && (
        <RenewSubscriptionDialog
          open={renewOpen}
          companyId={company.id}
          companyName={company.name}
          currentPlanCode={subscription?.plan?.code || "FULL_SUITE"}
          currentPlanName={subscription?.plan?.name || "Full Suite"}
          currentExpiryDate={subscription?.endDate || null}
          onClose={() => setRenewOpen(false)}
          onSuccess={() => {
            setRenewOpen(false);
          }}
        />
      )}

      {/* Cancel dialog */}
      {cancelOpen && (
        <CancelSubscriptionDialog
          open={cancelOpen}
          companyId={company.id}
          companyName={company.name}
          onClose={() => setCancelOpen(false)}
          onSuccess={() => {
            setCancelOpen(false);
          }}
        />
      )}

      {/* Change Plan dialog */}
      {changePlanOpen && (
        <ChangePlanDialog
          open={changePlanOpen}
          companyId={company.id}
          companyName={company.name}
          currentPlanCode={subscription?.plan?.code}
          onClose={() => setChangePlanOpen(false)}
          onSuccess={() => {
            setChangePlanOpen(false);
          }}
        />
      )}

      {/* Suspend dialog */}
      {suspendOpen && (
        <SuspendSubscriptionDialog
          open={suspendOpen}
          companyId={company.id}
          companyName={company.name}
          onClose={() => setSuspendOpen(false)}
          onSuccess={() => {
            setSuspendOpen(false);
          }}
        />
      )}
    </Box>
  );
}
