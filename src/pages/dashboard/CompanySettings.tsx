import { useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  Grid,
  Stack,
  Skeleton,
} from "@mui/material";
import AddOutlined from "@mui/icons-material/AddOutlined";
import toast from "react-hot-toast";

import { ErrorState, EmptyState } from "../../components/ui";
import {
  CompanyHeader,
  CompanySetupAlert,
  CompanyInfoSection,
  RegisteredAddressSection,
  TaxAndFySection,
  TdsStatutorySection,
  ResponsiblePersonSection,
  PayrollConfigSection,
  TeamManagementCard,
  CompanyDangerZone,
  CompanyForm,
  EditStatutoryDialog,
  EditResponsiblePersonDialog,
  EditTaxSettingsDialog,
  EditPayrollSettingsDialog,
} from "../../components/company";

import {
  useCompany,
  useCreateCompany,
  useUpdateCompany,
} from "../../hooks/company";
import { useCurrentRole } from "../../hooks/user";
import { CompanyRole } from "../../constants/enums";
import { useCompanyStore } from "../../store/company.store";
import { useAuthStore } from "../../store/auth.store";
import { getErrorMessage } from "../../utils/errorHandler";
import type { CompanyFormData } from "../../schemas/company.schema";
import type { Company, CreateCompanyPayload, UpdateCompanyPayload } from "../../types";

const EMPTY_COMPANY_FORM: CompanyFormData = {
  name: "",
  email: "",
  phone: "",
  address: "",
  website: "",
  financialYearStartMonth: "",
  primaryCountryCode: "",
  pan: "",
  tan: "",
};

export default function CompanySettings() {
  const { data: companyData, isLoading, isError, refetch } = useCompany();
  const updateMutation = useUpdateCompany();
  const createMutation = useCreateCompany();
  const setCompany = useCompanyStore((s) => s.setCompany);
  const clearCompany = useCompanyStore((s) => s.clearCompany);
  const setUser = useAuthStore((s) => s.setUser);

  // Local state overlay for extended statutory & master fields
  const [localOverlay, setLocalOverlay] = useState<Partial<Company>>({});

  // Dialog States
  const [editingInfo, setEditingInfo] = useState(false);
  const [editingStatutory, setEditingStatutory] = useState(false);
  const [editingResponsiblePerson, setEditingResponsiblePerson] = useState(false);
  const [editingTaxSettings, setEditingTaxSettings] = useState(false);
  const [editingPayrollSettings, setEditingPayrollSettings] = useState(false);
  const [creating, setCreating] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleted, setDeleted] = useState(false);
  const role = useCurrentRole();
  const isOwner = role === CompanyRole.OWNER;

  const canViewTeam =
    role === CompanyRole.OWNER ||
    role === CompanyRole.ADMIN ||
    role === CompanyRole.HR;

  // Merged Company object (Backend data + local statutory overlay)
  const company = useMemo<Company | null>(() => {
    if (!companyData) return null;
    return {
      ...companyData,
      ...localOverlay,
      responsiblePerson: localOverlay.responsiblePerson || companyData.responsiblePerson,
      payrollConfig: localOverlay.payrollConfig || companyData.payrollConfig,
    };
  }, [companyData, localOverlay]);

  const initialValues = useMemo<CompanyFormData>(
    () => ({
      name: company?.name ?? "",
      email: company?.email ?? "",
      phone: company?.phone ?? "",
      address: company?.address ?? "",
      website: company?.website ?? "",
      financialYearStartMonth: (company?.financialYearStartMonth != null
        ? String(company.financialYearStartMonth)
        : "") as CompanyFormData["financialYearStartMonth"],
      primaryCountryCode: company?.primaryCountryCode ?? "",
      pan: company?.pan ?? "",
      tan: company?.tan ?? "",
    }),
    [company]
  );

  const closeCreate = () => {
    if (createMutation.isPending) return;
    setCreating(false);
  };

  const handleCreate = (values: CompanyFormData) => {
    const payload: CreateCompanyPayload = {
      name: values.name.trim(),
      email: values.email?.trim() || undefined,
      phone: values.phone?.trim() || undefined,
      address: values.address?.trim() || undefined,
      website: values.website?.trim() || undefined,
      financialYearStartMonth: values.financialYearStartMonth
        ? Number(values.financialYearStartMonth)
        : undefined,
      primaryCountryCode:
        values.primaryCountryCode?.trim().toUpperCase() || undefined,
      pan: values.pan?.trim() || undefined,
      tan: values.tan?.trim() || undefined,
    };

    createMutation.mutate(payload, {
      onSuccess: (created) => {
        toast.success("Company created successfully");
        setCompany(created);
        setDeleted(false);
        setCreating(false);
      },
      onError: (error) => toast.error(getErrorMessage(error)),
    });
  };

  const handleSaveCompanyInfo = (values: CompanyFormData) => {
    const payload: UpdateCompanyPayload = {
      name: values.name.trim(),
      email: values.email?.trim() || undefined,
      phone: values.phone?.trim() || undefined,
      address: values.address?.trim() || undefined,
      website: values.website?.trim() || undefined,
      financialYearStartMonth: values.financialYearStartMonth
        ? Number(values.financialYearStartMonth)
        : undefined,
      primaryCountryCode:
        values.primaryCountryCode?.trim().toUpperCase() || undefined,
      pan: values.pan?.trim() || undefined,
      tan: values.tan?.trim() || undefined,
    };

    updateMutation.mutate(payload, {
      onSuccess: (updated) => {
        toast.success("Company profile updated successfully");
        setCompany({ ...updated, ...localOverlay });
        setEditingInfo(false);
      },
      onError: (error) => toast.error(getErrorMessage(error)),
    });
  };

  const handleSavePartial = (partial: Partial<Company>) => {
    const backendPayload: UpdateCompanyPayload = {};
    if (partial.pan !== undefined) backendPayload.pan = partial.pan;
    if (partial.tan !== undefined) backendPayload.tan = partial.tan;
    if (partial.financialYearStartMonth !== undefined)
      backendPayload.financialYearStartMonth = partial.financialYearStartMonth;
    if (partial.employeeViewEnabled !== undefined)
      backendPayload.employeeViewEnabled = partial.employeeViewEnabled;

    setLocalOverlay((prev) => ({ ...prev, ...partial }));

    if (Object.keys(backendPayload).length > 0 && companyData) {
      updateMutation.mutate(backendPayload, {
        onSuccess: (updated) => {
          toast.success("Configuration updated successfully");
          setCompany({ ...updated, ...localOverlay, ...partial });
        },
        onError: (error) => toast.error(getErrorMessage(error)),
      });
    } else {
      toast.success("Configuration updated successfully");
    }

    setEditingStatutory(false);
    setEditingResponsiblePerson(false);
    setEditingTaxSettings(false);
    setEditingPayrollSettings(false);
  };

  const handleDeleted = () => {
    clearCompany();
    setUser({ company: undefined, role: undefined });
    setDeleted(true);
  };

  const scrollToAdmins = () => {
    const el = document.getElementById("company-administrators-section");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  if (isLoading) {
    return (
      <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5, maxWidth: 1320, mx: "auto" }}>
        <Skeleton variant="rounded" height={100} sx={{ borderRadius: "8px" }} />
        <Grid container spacing={2.5}>
          <Grid size={{ xs: 12, md: 6 }}>
            <Skeleton variant="rounded" height={240} sx={{ borderRadius: "8px" }} />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <Skeleton variant="rounded" height={240} sx={{ borderRadius: "8px" }} />
          </Grid>
        </Grid>
      </Box>
    );
  }

  if (isError) {
    return (
      <Box sx={{ maxWidth: 560, mx: "auto", mt: { xs: 2, md: 6 } }}>
        <ErrorState
          description="Unable to load company details."
          onRetry={() => refetch()}
        />
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 1320, mx: "auto", pb: 6 }}>
      {deleted ? (
        <Stack spacing={3} sx={{ alignItems: "flex-start" }}>
          <Alert severity="success" sx={{ width: "100%", borderRadius: "6px" }}>
            This company has been deleted. Create another company to continue.
          </Alert>
          <Button
            variant="contained"
            startIcon={<AddOutlined sx={{ fontSize: 16 }} />}
            onClick={() => setCreating(true)}
            sx={{
              height: "40px",
              borderRadius: "6px",
              bgcolor: "#2563EB",
              textTransform: "none",
              fontWeight: 600,
              boxShadow: "none",
              px: 3,
              "&:hover": { bgcolor: "#1D4ED8", boxShadow: "none" },
            }}
          >
            Create Company
          </Button>
        </Stack>
      ) : !company ? (
        <EmptyState
          title="No active company master"
          description="Create a company master to configure TDS, statutory registrations, and payroll rules."
          action={
            <Button
              variant="contained"
              startIcon={<AddOutlined sx={{ fontSize: 16 }} />}
              onClick={() => setCreating(true)}
              sx={{
                height: "40px",
                borderRadius: "6px",
                bgcolor: "#2563EB",
                textTransform: "none",
                fontWeight: 600,
                boxShadow: "none",
                px: 3,
                "&:hover": { bgcolor: "#1D4ED8", boxShadow: "none" },
              }}
            >
              Create Company Master
            </Button>
          }
        />
      ) : (
        <Stack spacing={2.5}>
          {/* Header */}
          <CompanyHeader
            company={company}
            role={role}
            onEdit={() => setEditingInfo(true)}
            onManageAdmins={scrollToAdmins}
            onDeleteClick={() => setDeleteDialogOpen(true)}
          />

          {/* Compact Setup Warning Alert (Only shown when items are missing) */}
          <CompanySetupAlert
            company={company}
            onFixClick={() => {
              if (!company.pan || !company.tan) setEditingStatutory(true);
              else if (!company.responsiblePerson?.pan) setEditingResponsiblePerson(true);
              else setEditingInfo(true);
            }}
          />

          {/* 2-Column Main Information Layout */}
          <Grid container spacing={2.5} sx={{ gridAutoRows: "1fr" }}>
            {/* Left Column */}
            <Grid size={{ xs: 12, lg: 6 }}>
              <Stack spacing={2.5}>
                <CompanyInfoSection company={company} onEdit={() => setEditingInfo(true)} />
                <RegisteredAddressSection company={company} onEdit={() => setEditingInfo(true)} />
                <TaxAndFySection company={company} onConfigure={() => setEditingTaxSettings(true)} />
              </Stack>
            </Grid>

            {/* Right Column */}
            <Grid size={{ xs: 12, lg: 6 }}>
              <Stack spacing={2.5}>
                <TdsStatutorySection company={company} onEdit={() => setEditingStatutory(true)} />
                <ResponsiblePersonSection company={company} onEdit={() => setEditingResponsiblePerson(true)} />
                <PayrollConfigSection company={company} onManage={() => setEditingPayrollSettings(true)} />
              </Stack>
            </Grid>
          </Grid>

          {/* Company Administrators Section */}
          {canViewTeam && (
            <Box id="company-administrators-section">
              <TeamManagementCard canManage={isOwner} />
            </Box>
          )}

          {/* Danger Zone */}
          {isOwner && (
            <CompanyDangerZone
              company={company}
              onDeleted={handleDeleted}
            />
          )}
        </Stack>
      )}

      {/* Edit Company Info Dialog */}
      <Dialog
        open={editingInfo}
        onClose={() => setEditingInfo(false)}
        maxWidth="md"
        fullWidth
        slotProps={{ paper: { sx: { borderRadius: "8px" } } }}
      >
        <DialogTitle sx={{ fontWeight: 700, fontSize: "17px" }}>
          Edit Company Information &amp; Address
        </DialogTitle>
        <DialogContent>
          <CompanyForm
            initialValues={initialValues}
            onSubmit={handleSaveCompanyInfo}
            loading={updateMutation.isPending}
            onCancel={() => setEditingInfo(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Statutory Details Dialog */}
      {company && (
        <EditStatutoryDialog
          open={editingStatutory}
          onClose={() => setEditingStatutory(false)}
          company={company}
          onSave={handleSavePartial}
          loading={updateMutation.isPending}
        />
      )}

      {/* Edit Responsible Person Dialog */}
      {company && (
        <EditResponsiblePersonDialog
          open={editingResponsiblePerson}
          onClose={() => setEditingResponsiblePerson(false)}
          company={company}
          onSave={handleSavePartial}
          loading={updateMutation.isPending}
        />
      )}

      {/* Configure Tax Settings Dialog */}
      {company && (
        <EditTaxSettingsDialog
          open={editingTaxSettings}
          onClose={() => setEditingTaxSettings(false)}
          company={company}
          onSave={handleSavePartial}
          loading={updateMutation.isPending}
        />
      )}

      {/* Manage Payroll Settings Dialog */}
      {company && (
        <EditPayrollSettingsDialog
          open={editingPayrollSettings}
          onClose={() => setEditingPayrollSettings(false)}
          company={company}
          onSave={handleSavePartial}
        />
      )}

      {/* Delete Company Dialog */}
      {company && (
        <Dialog
          open={deleteDialogOpen}
          onClose={() => setDeleteDialogOpen(false)}
          maxWidth="sm"
          fullWidth
          slotProps={{ paper: { sx: { borderRadius: "8px" } } }}
        >
          <CompanyDangerZone
            company={company}
            onDeleted={() => {
              setDeleteDialogOpen(false);
              handleDeleted();
            }}
          />
        </Dialog>
      )}

      {/* Create Company Master Dialog */}
      <Dialog
        open={creating}
        onClose={closeCreate}
        maxWidth="md"
        fullWidth
        slotProps={{ paper: { sx: { borderRadius: "8px" } } }}
      >
        <DialogTitle sx={{ fontWeight: 700, fontSize: "17px" }}>Create Company Master</DialogTitle>
        <DialogContent>
          <CompanyForm
            initialValues={EMPTY_COMPANY_FORM}
            onSubmit={handleCreate}
            loading={createMutation.isPending}
            onCancel={closeCreate}
            submitLabel="Create Company Master"
          />
        </DialogContent>
      </Dialog>
    </Box>
  );
}
