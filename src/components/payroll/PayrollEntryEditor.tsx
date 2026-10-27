import { useEffect, useMemo } from "react";
import {
  Controller,
  useFieldArray,
  useForm,
  useWatch,
} from "react-hook-form";
import type { Control, Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  MenuItem,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import { MdAdd, MdDeleteOutline } from "react-icons/md";
import toast from "react-hot-toast";

import { useUpdatePayrollEntry } from "../../hooks/payroll";
import { PAY_COMPONENT_TYPE_OPTIONS } from "../../constants/enums";
import { updateEntrySchema } from "../../schemas/payroll.schema";
import type { PayrollEntryFormData } from "../../schemas/payroll.schema";
import type { PayrollEntry, UpdateEntryPayload } from "../../types";
import { formatCurrency, toNumber } from "../../utils/format";
import { getErrorMessage } from "../../utils/errorHandler";

export interface PayrollEntryEditorProps {
  open: boolean;
  entry: PayrollEntry | null;
  onClose: () => void;
}

// A single blank component row (used when an entry has none yet).
const BLANK_COMPONENT = {
  code: "",
  name: "",
  type: "EARNING" as const,
  amount: 0,
};

// Entry -> form values. Money amounts may arrive as strings, so coerce them to
// numbers; an entry with no components starts with one blank row (the schema
// requires at least one).
const toFormValues = (entry: PayrollEntry | null): PayrollEntryFormData => {
  const components = (entry?.components ?? []).map((c) => ({
    code: c.code,
    name: c.name,
    type: c.type,
    amount: toNumber(c.amount) ?? 0,
  }));
  return {
    components: components.length ? components : [{ ...BLANK_COMPONENT }],
    daysInMonth: entry?.daysInMonth,
    effectiveWorkdays: entry?.effectiveWorkdays,
    remarks: entry?.remarks ?? "",
  };
};

// Live earning/deduction/net preview computed from the component rows. Backend
// totals can be absent (contract audit), so the editor derives them itself.
function TotalsPreview({
  control,
}: {
  control: Control<PayrollEntryFormData>;
}) {
  const components = useWatch({ control, name: "components" });
  const { earnings, deductions } = (components ?? []).reduce(
    (acc, c) => {
      const amount = toNumber(c?.amount) ?? 0;
      if (c?.type === "DEDUCTION") acc.deductions += amount;
      else acc.earnings += amount;
      return acc;
    },
    { earnings: 0, deductions: 0 }
  );
  const net = earnings - deductions;

  return (
    <Box
      sx={{
        display: "flex",
        flexWrap: "wrap",
        gap: 3,
        mt: 2,
        p: 2,
        borderRadius: 2,
        bgcolor: "action.hover",
      }}
    >
      <Box>
        <Typography variant="caption" color="text.secondary">
          Gross Earnings
        </Typography>
        <Typography color="text.primary" sx={{ fontWeight: 700 }}>
          {formatCurrency(earnings)}
        </Typography>
      </Box>
      <Box>
        <Typography variant="caption" color="text.secondary">
          Total Deductions
        </Typography>
        <Typography color="text.primary" sx={{ fontWeight: 700 }}>
          {formatCurrency(deductions)}
        </Typography>
      </Box>
      <Box>
        <Typography variant="caption" color="text.secondary">
          Net Pay
        </Typography>
        <Typography
          sx={{ fontWeight: 700 }}
          color={net < 0 ? "error.main" : "success.main"}
        >
          {formatCurrency(net)}
        </Typography>
      </Box>
    </Box>
  );
}

// Self-contained payroll-entry editor. Owns the update mutation and the RHF/Zod
// form. The whole component list is replaced on save (matches UpdateEntryPayload).
export default function PayrollEntryEditor({
  open,
  entry,
  onClose,
}: PayrollEntryEditorProps) {
  const updateMutation = useUpdatePayrollEntry();
  const { isPending } = updateMutation;

  // Stable defaults so the reset effect only fires when the target entry changes.
  const initialValues = useMemo(() => toFormValues(entry), [entry]);

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PayrollEntryFormData>({
    // Zod 4's `z.coerce` makes the schema input type `unknown`, so zodResolver
    // returns a 3-generic Resolver that RHF's single-generic useForm rejects.
    // Coercion still runs at validation time; only the static type is realigned.
    resolver: zodResolver(updateEntrySchema) as unknown as Resolver<PayrollEntryFormData>,
    defaultValues: initialValues,
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "components",
  });

  useEffect(() => {
    reset(initialValues);
  }, [initialValues, reset]);

  const employeeLabel =
    entry?.employeeName ??
    entry?.employeeCode ??
    entry?.employeeId ??
    "this employee";

  const onSubmit = (values: PayrollEntryFormData) => {
    if (!entry) return;

    const payload: UpdateEntryPayload = {
      components: values.components,
      daysInMonth: values.daysInMonth,
      effectiveWorkdays: values.effectiveWorkdays,
      remarks: values.remarks?.trim() ? values.remarks.trim() : undefined,
    };

    updateMutation.mutate(
      { entryId: entry.id, data: payload },
      {
        onSuccess: () => {
          toast.success("Payroll entry updated");
          onClose();
        },
        onError: (error) => toast.error(getErrorMessage(error)),
      }
    );
  };

  return (
    <Dialog
      open={open}
      onClose={isPending ? undefined : onClose}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle sx={{ fontWeight: 700 }}>
        Edit Payroll Entry
        <Typography variant="body2" color="text.secondary">
          {employeeLabel}
        </Typography>
      </DialogTitle>

      <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
        <DialogContent>
          {/* Component rows */}
          <Typography color="text.primary" sx={{ fontWeight: 700, mb: 1 }}>
            Pay Components
          </Typography>

          {typeof errors.components?.message === "string" && (
            <Typography variant="caption" color="error" sx={{ mb: 1 }}>
              {errors.components.message}
            </Typography>
          )}

          {fields.map((fieldRow, index) => (
            <Box
              key={fieldRow.id}
              sx={{
                display: "grid",
                gridTemplateColumns: {
                  xs: "1fr",
                  sm: "1fr 1.4fr 1fr 1fr auto",
                },
                gap: 1.5,
                alignItems: "start",
                mb: 1,
              }}
            >
              <TextField
                label="Code"
                size="small"
                fullWidth
                disabled={isPending}
                {...register(`components.${index}.code`)}
                error={!!errors.components?.[index]?.code}
                helperText={errors.components?.[index]?.code?.message ?? " "}
              />
              <TextField
                label="Name"
                size="small"
                fullWidth
                disabled={isPending}
                {...register(`components.${index}.name`)}
                error={!!errors.components?.[index]?.name}
                helperText={errors.components?.[index]?.name?.message ?? " "}
              />
              <Controller
                name={`components.${index}.type`}
                control={control}
                render={({ field }) => (
                  <TextField
                    select
                    label="Type"
                    size="small"
                    fullWidth
                    disabled={isPending}
                    {...field}
                    error={!!errors.components?.[index]?.type}
                    helperText={errors.components?.[index]?.type?.message ?? " "}
                  >
                    {PAY_COMPONENT_TYPE_OPTIONS.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </TextField>
                )}
              />
              <TextField
                label="Amount"
                type="number"
                size="small"
                fullWidth
                disabled={isPending}
                {...register(`components.${index}.amount`)}
                error={!!errors.components?.[index]?.amount}
                helperText={errors.components?.[index]?.amount?.message ?? " "}
              />
              <Tooltip title="Remove component">
                <span>
                  <IconButton
                    aria-label={`Remove component ${index + 1}`}
                    onClick={() => remove(index)}
                    disabled={isPending || fields.length <= 1}
                    sx={{ color: "error.main", mt: 0.5 }}
                  >
                    <MdDeleteOutline size={20} />
                  </IconButton>
                </span>
              </Tooltip>
            </Box>
          ))}

          <Button
            startIcon={<MdAdd size={18} />}
            onClick={() => append({ ...BLANK_COMPONENT })}
            disabled={isPending}
            sx={{ textTransform: "none", mt: 0.5 }}
          >
            Add component
          </Button>

          <TotalsPreview control={control} />

          {/* Metadata */}
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
              gap: 2,
              mt: 3,
            }}
          >
            <Controller
              name="daysInMonth"
              control={control}
              render={({ field }) => (
                <TextField
                  label="Days in Month"
                  type="number"
                  fullWidth
                  disabled={isPending}
                  value={field.value ?? ""}
                  onChange={(e) =>
                    field.onChange(
                      e.target.value === "" ? undefined : Number(e.target.value)
                    )
                  }
                  onBlur={field.onBlur}
                  error={!!errors.daysInMonth}
                  helperText={errors.daysInMonth?.message ?? " "}
                />
              )}
            />
            <Controller
              name="effectiveWorkdays"
              control={control}
              render={({ field }) => (
                <TextField
                  label="Effective Workdays"
                  type="number"
                  fullWidth
                  disabled={isPending}
                  value={field.value ?? ""}
                  onChange={(e) =>
                    field.onChange(
                      e.target.value === "" ? undefined : Number(e.target.value)
                    )
                  }
                  onBlur={field.onBlur}
                  error={!!errors.effectiveWorkdays}
                  helperText={errors.effectiveWorkdays?.message ?? " "}
                />
              )}
            />
            <Box sx={{ gridColumn: { xs: "auto", sm: "1 / -1" } }}>
              <TextField
                label="Remarks"
                fullWidth
                multiline
                minRows={2}
                disabled={isPending}
                {...register("remarks")}
                error={!!errors.remarks}
                helperText={errors.remarks?.message ?? " "}
              />
            </Box>
          </Box>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button variant="outlined" onClick={onClose} disabled={isPending}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={isPending}
            sx={{ minWidth: 150 }}
            startIcon={isPending ? <CircularProgress size={16} color="inherit" /> : undefined}
          >
            {"Save Changes"}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
}
