import { useEffect, useMemo, useState } from "react";
import { Box, Stepper, Step, StepLabel, Typography, Button, Divider } from "@mui/material";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import { AuthLayout, AuthCard } from "../../components/auth";
import CompanyForm from "../../components/company/CompanyForm";
import { useCreateCompany } from "../../hooks/company";
import { useAuthStore } from "../../store/auth.store";
import { useCompanyStore } from "../../store/company.store";
import { useMe } from "../../hooks/user";
import { logout as logoutApi } from "../../api/auth.api";
import { getErrorMessage } from "../../utils/errorHandler";
import type { CompanyFormData } from "../../schemas/company.schema";
import type { CreateCompanyPayload } from "../../types";

const steps = ["Create Organization"];

export default function CreateCompany() {
  const navigate = useNavigate();
  const { data: me, isLoading: meLoading } = useMe();
  const createMutation = useCreateCompany();
  const setCompany = useCompanyStore((s) => s.setCompany);
  const clearCompany = useCompanyStore((s) => s.clearCompany);
  const logout = useAuthStore((s) => s.logout);
  const [loggingOut, setLoggingOut] = useState(false);

  // Fetch pending company name from local storage if saved during signup
  const pendingName = useMemo(() => {
    return localStorage.getItem("pendingCompanyName") || "";
  }, []);

  const initialValues: CompanyFormData = useMemo(
    () => ({
      name: pendingName,
      email: me?.email ?? "",
      phone: "",
      address: "",
    }),
    [pendingName, me]
  );

  // Guard: If they already have a company associated, redirect them to dashboard:
  useEffect(() => {
    if (meLoading) return;
    const hasCompany = me?.company?.id || me?.companyId;
    if (hasCompany) {
      navigate("/dashboard", { replace: true });
    }
  }, [me, meLoading, navigate]);

  const handleCreate = (values: CompanyFormData) => {
    const payload: CreateCompanyPayload = {
      name: values.name.trim(),
      email: values.email?.trim() || undefined,
      phone: values.phone?.trim() || undefined,
      address: values.address?.trim() || undefined,
    };

    createMutation.mutate(payload, {
      onSuccess: (created) => {
        toast.success("Organization created successfully!");
        setCompany(created);
        localStorage.removeItem("pendingCompanyName");
        navigate("/dashboard", { replace: true });
      },
      onError: (error) => {
        toast.error(getErrorMessage(error));
      },
    });
  };

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await logoutApi();
    } catch (error) {
      console.error(error);
    } finally {
      logout();
      clearCompany();
      toast.success("Signed out");
      navigate("/login", { replace: true });
    }
  };

  return (
    <AuthLayout>
      <AuthCard>
        <Box sx={{ mb: 3 }}>
          <Typography variant="h5" sx={{ fontWeight: 800, color: "text.primary", mb: 0.5 }}>
            Create Your Organization
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Create your organization, then add branches and departments.
          </Typography>
        </Box>

        {/* Custom Stepper */}
        <Box sx={{ width: "100%", mb: 4 }}>
          <Stepper activeStep={0} alternativeLabel sx={{
            "& .MuiStepIcon-root.Mui-active": { color: "#8B5CF6" },
            "& .MuiStepIcon-root.Mui-completed": { color: "#10B981" },
            "& .MuiStepLabel-label": { fontSize: "12px", fontWeight: 500 }
          }}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
        </Box>

        <Divider sx={{ mb: 3 }} />

        {/* Company creation form */}
        <CompanyForm
          initialValues={initialValues}
          onSubmit={handleCreate}
          loading={createMutation.isPending}
          submitLabel="Create & Continue"
        />

        <Box sx={{ mt: 4, display: "flex", justifyContent: "center" }}>
          <Button
            variant="text"
            color="secondary"
            onClick={handleLogout}
            disabled={loggingOut || createMutation.isPending}
            sx={{ textTransform: "none", fontWeight: 600, fontSize: "14px" }}
          >
            {loggingOut ? "Signing out..." : "Sign out & switch account"}
          </Button>
        </Box>
      </AuthCard>
    </AuthLayout>
  );
}
