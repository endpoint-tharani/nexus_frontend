import { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Stepper,
  Step,
  StepLabel,
  Box,
  Typography,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Grid,
  Card,
  CardContent,
  Chip,
  CircularProgress,
} from "@mui/material";
import dayjs from "dayjs";
import toast from "react-hot-toast";
import type { Company } from "../../../types/company.types";
import {
  useActivateSubscription,
  useSubscriptionPlans,
} from "../hooks/useSubscriptionAdmin";
import type { PaymentMode } from "../types";
import { getErrorMessage } from "../../../utils";

const PLAN_MODULES: Record<string, string[]> = {
  FULL_SUITE: ["TAX_DECLARATION", "ATTENDANCE", "LEAVE", "PAYROLL", "BIOMETRIC", "EMPLOYEE_PORTAL", "COMPLIANCE"],
  TDS: ["TAX_DECLARATION", "ATTENDANCE", "PAYROLL", "EMPLOYEE_PORTAL"],
  TAX_DECLARATION: ["TAX_DECLARATION"],
  ATTENDANCE: ["ATTENDANCE"],
  LEAVE: ["LEAVE"],
  PAYROLL: ["PAYROLL"],
  BIOMETRIC: ["BIOMETRIC"],
  EMPLOYEE_PORTAL: ["EMPLOYEE_PORTAL"],
  COMPLIANCE: ["COMPLIANCE"],
  ATTENDANCE_PAYROLL: ["ATTENDANCE", "PAYROLL"],
  ATTENDANCE_LEAVE_PAYROLL: ["ATTENDANCE", "LEAVE", "PAYROLL"],
};

interface ActivateSubscriptionDialogProps {
  open: boolean;
  onClose: () => void;
  company: Company | null;
  onSuccess?: (planCode: string, durationMonths: number) => void;
}

export default function ActivateSubscriptionDialog({
  open,
  onClose,
  company,
  onSuccess,
}: ActivateSubscriptionDialogProps) {
  const [activeStep, setActiveStep] = useState(0);
  const { data: plans = [] } = useSubscriptionPlans();
  const activateMutation = useActivateSubscription();

  // Form State
  const [planCode, setPlanCode] = useState("");
  const [durationMonths, setDurationMonths] = useState<number>(1);
  const [paymentMode, setPaymentMode] = useState<PaymentMode>("UPI");
  const [paymentReference, setPaymentReference] = useState("");
  const [amount, setAmount] = useState<string>("");
  const [currency, setCurrency] = useState("INR");
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [notes, setNotes] = useState("");

  if (!company) return null;

  const steps = ["Company Information", "Subscription Details", "Payment Metadata"];

  const handleNext = () => {
    setActiveStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  const handleClose = () => {
    setActiveStep(0);
    setPlanCode("");
    setDurationMonths(1);
    setPaymentMode("UPI");
    setPaymentReference("");
    setAmount("");
    setCurrency("INR");
    setInvoiceNumber("");
    setNotes("");
    onClose();
  };

  const handleSubmit = () => {
    if (!planCode) {
      toast.error("Please select a plan");
      return;
    }

    activateMutation.mutate(
      {
        companyId: company.id,
        planCode,
        durationMonths,
        paymentMode,
        paymentReference: paymentReference || undefined,
        amount: amount ? parseFloat(amount) : undefined,
        currency: currency || undefined,
        invoiceNumber: invoiceNumber || undefined,
        notes: notes || undefined,
      },
      {
        onSuccess: () => {
          toast.success("Subscription activated successfully");
          if (onSuccess) onSuccess(planCode, durationMonths);
          handleClose();
        },
        onError: (err) => {
          toast.error(getErrorMessage(err));
        },
      }
    );
  };

  const calculatedExpiryDate = dayjs().add(durationMonths, "month").format("DD MMM YYYY");
  const selectedPlan = plans.find((p) => p.code === planCode);
  const modulesIncluded = planCode ? PLAN_MODULES[planCode] ?? [] : [];

  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <Box sx={{ mt: 3, display: "flex", flexDirection: "column", gap: 2 }}>
            <TextField
              label="Company ID"
              value={company.id}
              slotProps={{ input: { readOnly: true } }}
              fullWidth
            />
            <TextField
              label="Company Name"
              value={company.name}
              slotProps={{ input: { readOnly: true } }}
              fullWidth
            />
            <TextField
              label="Email Address"
              value={company.email || "—"}
              slotProps={{ input: { readOnly: true } }}
              fullWidth
            />
          </Box>
        );
      case 1:
        return (
          <Box sx={{ mt: 3, display: "flex", flexDirection: "column", gap: 2 }}>
            <FormControl fullWidth required>
              <InputLabel id="plan-select-label">Plan</InputLabel>
              <Select
                labelId="plan-select-label"
                value={planCode}
                label="Plan"
                onChange={(e) => setPlanCode(e.target.value)}
              >
                {plans.map((plan) => (
                  <MenuItem key={plan.id} value={plan.code}>
                    {plan.name} ({plan.code})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth required>
              <InputLabel id="duration-select-label">Duration</InputLabel>
              <Select
                labelId="duration-select-label"
                value={durationMonths}
                label="Duration"
                onChange={(e) => setDurationMonths(Number(e.target.value))}
              >
                <MenuItem value={1}>1 Month</MenuItem>
                <MenuItem value={3}>3 Months</MenuItem>
                <MenuItem value={6}>6 Months</MenuItem>
                <MenuItem value={12}>12 Months</MenuItem>
                <MenuItem value={24}>24 Months</MenuItem>
              </Select>
            </FormControl>
          </Box>
        );
      case 2:
        return (
          <Grid container spacing={2} sx={{ mt: 2 }}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <FormControl fullWidth required>
                <InputLabel id="payment-mode-label">Payment Mode</InputLabel>
                <Select
                  labelId="payment-mode-label"
                  value={paymentMode}
                  label="Payment Mode"
                  onChange={(e) => setPaymentMode(e.target.value as PaymentMode)}
                >
                  <MenuItem value="UPI">UPI</MenuItem>
                  <MenuItem value="BANK_TRANSFER">Bank Transfer</MenuItem>
                  <MenuItem value="CHEQUE">Cheque</MenuItem>
                  <MenuItem value="CASH">Cash</MenuItem>
                  <MenuItem value="INVOICE">Invoice</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="Payment Reference"
                value={paymentReference}
                onChange={(e) => setPaymentReference(e.target.value)}
                placeholder="Transaction ID / Check Number"
                fullWidth
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="Amount"
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="15000"
                fullWidth
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="Currency"
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                placeholder="INR"
                fullWidth
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                label="Invoice Number"
                value={invoiceNumber}
                onChange={(e) => setInvoiceNumber(e.target.value)}
                placeholder="INV-2026-001"
                fullWidth
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                label="Notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Additional notes for bookkeeping"
                multiline
                rows={2}
                fullWidth
              />
            </Grid>
          </Grid>
        );
      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontWeight: 700 }}>Activate Subscription</DialogTitle>
      <DialogContent dividers>
        <Stepper activeStep={activeStep} alternativeLabel>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {renderStepContent(activeStep)}

        {/* Summary Card for Steps 1 and 2 */}
        {activeStep > 0 && planCode && (
          <Card variant="outlined" sx={{ mt: 3, bgcolor: "background.default" }}>
            <CardContent>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5 }}>
                Provisioning Summary
              </Typography>
              <Grid container spacing={2}>
                <Grid size={{ xs: 6 }}>
                  <Typography variant="caption" color="text.secondary" sx={{ display: "block" }}>
                    Selected Plan
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {selectedPlan?.name || planCode}
                  </Typography>
                </Grid>
                <Grid size={{ xs: 6 }}>
                  <Typography variant="caption" color="text.secondary" sx={{ display: "block" }}>
                    Estimated Expiry
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {calculatedExpiryDate} ({durationMonths} Month{durationMonths > 1 ? "s" : ""})
                  </Typography>
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 0.5 }}>
                    Modules Enabled
                  </Typography>
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.75 }}>
                    {modulesIncluded.map((m) => (
                      <Chip key={m} label={m} size="small" variant="outlined" color="primary" />
                    ))}
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        )}
      </DialogContent>
      <DialogActions sx={{ p: 2.5, gap: 1 }}>
        <Button onClick={handleClose} variant="outlined" disabled={activateMutation.isPending}>
          Cancel
        </Button>
        {activeStep > 0 && (
          <Button onClick={handleBack} variant="outlined" disabled={activateMutation.isPending}>
            Back
          </Button>
        )}
        {activeStep < steps.length - 1 ? (
          <Button onClick={handleNext} variant="contained" disabled={activeStep === 1 && !planCode}>
            Next
          </Button>
        ) : (
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={activateMutation.isPending}
            startIcon={
              activateMutation.isPending ? <CircularProgress size={16} color="inherit" /> : null
            }
          >
            Activate Subscription
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}
