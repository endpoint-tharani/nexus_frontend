import { useEffect, useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Box,
  Button,
  Chip,
  IconButton,
  MenuItem,
  Stack,
  TextField,
  Tooltip,
  Typography,
  Switch,
  FormControlLabel,
  Alert,
} from "@mui/material";
import { MdAdd, MdDelete, MdSettings } from "react-icons/md";
import type { ColumnDef } from "@tanstack/react-table";
import toast from "react-hot-toast";

import {
  ConfirmDialog,
  DataTable,
  PageHeader,
  SectionCard,
} from "../../components/ui";
import { SectionConfigDialog, TaxFieldFormDialog } from "../../components/taxConfig";
import {
  useCompanyTaxConfig,
  useCreateCustomField,
  useDeleteCustomField,
  useSetStandardDeduction,
  useStandardDeduction,
  useUpsertSectionConfig,
  useProofUploadWindow,
  useSetProofUploadWindow,
} from "../../hooks/taxConfig";
import { useCurrentRole } from "../../hooks/user";
import { CompanyRole } from "../../constants/enums";
import { financialYearOptions, getFinancialYear } from "../../utils/format";
import {
  standardDeductionFormSchema,
  type CustomFieldFormData,
  type SectionConfigFormData,
  type StandardDeductionFormData,
} from "../../schemas/taxConfig.schema";
import { getErrorMessage } from "../../utils/errorHandler";
import type {
  CompanyConfigSection,
  CompanyCustomField,
} from "../../types";

const CURRENT_FY = getFinancialYear(new Date());
const FY_OPTIONS = financialYearOptions(CURRENT_FY, 5);

// Standard-deduction editor (its own form so it resets independently of the
// section/field tables).
function StandardDeductionCard({
  year,
  isOwner,
}: {
  year: number;
  isOwner: boolean;
}) {
  const { data, isLoading } = useStandardDeduction(year);
  const save = useSetStandardDeduction();

  const initialValues = useMemo<StandardDeductionFormData>(
    () => ({
      oldRegime: data ? String(data.oldRegime) : "50000",
      newRegime: data ? String(data.newRegime) : "75000",
    }),
    [data]
  );

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<StandardDeductionFormData>({
    resolver: zodResolver(standardDeductionFormSchema),
    defaultValues: initialValues,
  });

  useEffect(() => {
    reset(initialValues);
  }, [initialValues, reset]);

  const onSubmit = (values: StandardDeductionFormData) => {
    save.mutate(
      {
        financialYearStart: year,
        oldRegime: Number(values.oldRegime),
        newRegime: Number(values.newRegime),
      },
      {
        onSuccess: () => toast.success("Standard deduction saved"),
        onError: (e) => toast.error(getErrorMessage(e)),
      }
    );
  };

  return (
    <SectionCard
      title="Standard Deduction"
      subtitle="Applied automatically to every employee's taxable income. Defaults: Old Regime ₹50,000 · New Regime ₹75,000"
    >
      <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            gap: 2,
            alignItems: "flex-start",
          }}
        >
          <Controller
            name="oldRegime"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Old Regime (₹)"
                type="number"
                size="small"
                disabled={!isOwner || isLoading || save.isPending}
                error={!!errors.oldRegime}
                helperText={errors.oldRegime?.message ?? " "}
                sx={{ minWidth: 180 }}
              />
            )}
          />
          <Controller
            name="newRegime"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="New Regime (₹)"
                type="number"
                size="small"
                disabled={!isOwner || isLoading || save.isPending}
                error={!!errors.newRegime}
                helperText={errors.newRegime?.message ?? " "}
                sx={{ minWidth: 180 }}
              />
            )}
          />
          {isOwner && (
            <Button
              type="submit"
              variant="contained"
              disabled={save.isPending || !isDirty}
              sx={{ mt: 0.5, height: 40 }}
            >
              Save
            </Button>
          )}
        </Box>
      </Box>
    </SectionCard>
  );
}

function ProofUploadWindowCard({
  year,
  isOwner,
}: {
  year: number;
  isOwner: boolean;
}) {
  const { data, isLoading } = useProofUploadWindow(year);
  const toggle = useSetProofUploadWindow();

  const isOpen = data ? data.proofUploadOpen : true;

  const handleToggle = () => {
    toggle.mutate(
      {
        year,
        proofUploadOpen: !isOpen,
      },
      {
        onSuccess: (res) => {
          toast.success(
            `Proof upload window is now ${res.proofUploadOpen ? "OPEN" : "CLOSED"}`
          );
        },
        onError: (e) => toast.error(getErrorMessage(e)),
      }
    );
  };

  if (isLoading) return null;

  return (
    <SectionCard
      title="Proof Upload Window"
      subtitle="Control whether employees can upload and modify their proof documents."
    >
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            Status:
          </Typography>
          <Typography
            variant="body2"
            sx={{ display: "flex", alignItems: "center", gap: 0.5, fontWeight: 600 }}
          >
            {isOpen ? "🟢 Open" : "🔴 Closed"}
          </Typography>
        </Stack>
        {isOwner && (
          <FormControlLabel
            control={
              <Switch
                checked={isOpen}
                onChange={handleToggle}
                disabled={toggle.isPending}
                color="primary"
              />
            }
            label={isOpen ? "Open for uploads" : "Closed for uploads"}
            sx={{ mr: 0 }}
          />
        )}
      </Box>
    </SectionCard>
  );
}

// Admin Tax Configuration: standard deduction + curate the deduction/exemption
// sections employees can declare + company custom fields. Visible to OWNER/ADMIN;
// writes are owner-only (and the backend enforces it too).
export default function TaxConfig() {
  const [year, setYear] = useState<number>(CURRENT_FY);
  const isOwner = useCurrentRole() === CompanyRole.OWNER;

  const { data, isLoading, isError, refetch } = useCompanyTaxConfig(year);

  const upsertSection = useUpsertSectionConfig();
  const createField = useCreateCustomField();
  const deleteField = useDeleteCustomField();

  const [editingSection, setEditingSection] =
    useState<CompanyConfigSection | null>(null);
  const [fieldOpen, setFieldOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<CompanyCustomField | null>(
    null
  );

  const sections = data?.sections ?? [];
  const customFields = data?.customFields ?? [];

  const handleSectionSubmit = (values: SectionConfigFormData) => {
    if (!editingSection) return;
    const label = values.overrideLabel.trim();
    upsertSection.mutate(
      {
        sectionId: editingSection.sectionId,
        financialYearStart: year,
        isEnabled: values.isEnabled,
        overrideLabel:
          label && label !== editingSection.masterLabel ? label : null,
        overrideCap:
          values.overrideCap.trim() === "" ? null : Number(values.overrideCap),
      },
      {
        onSuccess: () => {
          toast.success("Section updated");
          setEditingSection(null);
        },
        onError: (e) => toast.error(getErrorMessage(e)),
      }
    );
  };

  const handleFieldSubmit = (values: CustomFieldFormData) => {
    createField.mutate(
      {
        label: values.label.trim(),
        fieldKey: values.fieldKey.trim(),
        fieldType: values.fieldType,
        isRequired: values.isRequired,
        maxAmount:
          values.maxAmount.trim() === "" ? null : Number(values.maxAmount),
        sectionId: values.sectionId || null,
        financialYearStart: year,
      },
      {
        onSuccess: () => {
          toast.success("Custom field added");
          setFieldOpen(false);
        },
        onError: (e) => toast.error(getErrorMessage(e)),
      }
    );
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    deleteField.mutate(deleteTarget.id, {
      onSuccess: () => {
        toast.success("Field removed");
        setDeleteTarget(null);
      },
      onError: (e) => toast.error(getErrorMessage(e)),
    });
  };

  const sectionColumns = useMemo<ColumnDef<CompanyConfigSection>[]>(
    () => [
      {
        accessorKey: "label",
        header: "Section",
        cell: ({ row }) => (
          <Box>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              {row.original.label}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {row.original.shortName}
            </Typography>
          </Box>
        ),
      },
      {
        id: "regimes",
        header: "Regimes",
        enableSorting: false,
        cell: ({ row }) => {
          const { allowedOld, allowedNew } = row.original;
          const label =
            allowedOld && allowedNew
              ? "Both"
              : allowedOld
                ? "Old"
                : allowedNew
                  ? "New"
                  : "None";
          return <Chip size="small" label={label} variant="outlined" />;
        },
      },
      {
        id: "cap",
        header: "Cap",
        cell: ({ row }) =>
          row.original.cap != null ? (
            <Typography variant="body2">
              ₹{row.original.cap.toLocaleString("en-IN")}
            </Typography>
          ) : (
            <Typography variant="body2" color="text.disabled">
              —
            </Typography>
          ),
      },
      {
        id: "status",
        header: "Status",
        cell: ({ row }) => (
          <Chip
            size="small"
            label={row.original.isEnabled ? "Enabled" : "Disabled"}
            color={row.original.isEnabled ? "success" : "default"}
            sx={{ fontWeight: 600 }}
          />
        ),
      },
    ],
    []
  );

  const fieldColumns = useMemo<ColumnDef<CompanyCustomField>[]>(
    () => [
      {
        accessorKey: "label",
        header: "Label",
        cell: ({ row }) => (
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            {row.original.label}
          </Typography>
        ),
      },
      { accessorKey: "fieldKey", header: "Key" },
      {
        accessorKey: "fieldType",
        header: "Type",
        cell: ({ row }) => (
          <Chip size="small" label={row.original.fieldType} variant="outlined" />
        ),
      },
      {
        id: "required",
        header: "Required",
        cell: ({ row }) => (row.original.isRequired ? "Yes" : "No"),
      },
      {
        id: "maxAmount",
        header: "Max",
        cell: ({ row }) =>
          row.original.maxAmount != null
            ? `₹${row.original.maxAmount.toLocaleString("en-IN")}`
            : "—",
      },
    ],
    []
  );

  return (
    <Box>
      <PageHeader
        title="Tax Configuration"
        subtitle={data ? data.financialYear.label : "Loading…"}
        actions={
          <TextField
            select
            label="Financial Year"
            size="small"
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
            sx={{ minWidth: 200 }}
          >
            {FY_OPTIONS.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </TextField>
        }
      />

      {!isOwner && (
        <Alert severity="info" sx={{ mb: 2 }}>
          You can view the configuration. Only the company owner can make changes.
        </Alert>
      )}

      <Stack spacing={2}>
        <StandardDeductionCard year={year} isOwner={isOwner} />
        <ProofUploadWindowCard year={year} isOwner={isOwner} />

        <SectionCard
          title="Deduction & Exemption Sections"
          subtitle="Enable, relabel or cap the sections employees can declare."
          disableContentPadding
        >
          <DataTable
            columns={sectionColumns}
            data={sections}
            loading={isLoading}
            error={isError ? "Failed to load sections." : null}
            onRetry={refetch}
            emptyTitle="No sections"
            rowActions={
              isOwner
                ? (section) => (
                    <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                      <Tooltip title="Configure">
                        <IconButton
                          size="small"
                          aria-label="Configure section"
                          onClick={() => setEditingSection(section)}
                        >
                          <MdSettings size={18} />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  )
                : undefined
            }
          />
        </SectionCard>

        <SectionCard
          title="Custom Fields"
          subtitle="Company-specific declaration fields."
          actions={
            isOwner ? (
              <Button
                size="small"
                variant="contained"
                startIcon={<MdAdd size={18} />}
                onClick={() => setFieldOpen(true)}
              >
                Add field
              </Button>
            ) : undefined
          }
          disableContentPadding
        >
          <DataTable
            columns={fieldColumns}
            data={customFields}
            loading={isLoading}
            error={isError ? "Failed to load custom fields." : null}
            onRetry={refetch}
            emptyTitle="No custom fields"
            emptyDescription="Add a field to collect extra declaration data."
            rowActions={
              isOwner
                ? (field) => (
                    <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                      <Tooltip title="Delete">
                        <IconButton
                          size="small"
                          color="error"
                          aria-label="Delete field"
                          onClick={() => setDeleteTarget(field)}
                        >
                          <MdDelete size={18} />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  )
                : undefined
            }
          />
        </SectionCard>
      </Stack>

      <SectionConfigDialog
        open={!!editingSection}
        section={editingSection}
        loading={upsertSection.isPending}
        onSubmit={handleSectionSubmit}
        onClose={() => setEditingSection(null)}
      />

      <TaxFieldFormDialog
        open={fieldOpen}
        sections={sections}
        loading={createField.isPending}
        onSubmit={handleFieldSubmit}
        onClose={() => setFieldOpen(false)}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete custom field"
        message={
          deleteTarget
            ? `Remove “${deleteTarget.label}”? Employees will no longer see this field.`
            : undefined
        }
        confirmLabel="Delete"
        loading={deleteField.isPending}
        onConfirm={handleDelete}
        onClose={() => setDeleteTarget(null)}
      />
    </Box>
  );
}
