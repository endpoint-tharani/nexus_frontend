import { useEffect, useState } from "react";
import { Box, Stepper, Step, StepLabel, Typography, Button, Divider, Card, CardContent } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { MdChatBubble, MdEmail, MdLockOutline } from "react-icons/md";
import toast from "react-hot-toast";

import { AuthLayout, AuthCard } from "../../components/auth";
import { useAuthStore } from "../../store/auth.store";
import { useCompanyStore } from "../../store/company.store";
import { useMe } from "../../hooks/user";
import { useSubscriptionAccess } from "../../core/subscription";
import { useTawkTo } from "../../hooks/shared/useTawkTo";
import { logout as logoutApi } from "../../api/auth.api";
import { clearAppSession } from "../../utils/logout";

const steps = ["Register Company", "Account Activation"];

export default function ActivateCompany() {
  const navigate = useNavigate();
  const { data: me, isLoading: meLoading } = useMe();
  const company = useCompanyStore((s) => s.company);
  const { subscription, loading: subLoading, isCompanyNotFound } = useSubscriptionAccess({ refetchInterval: 5000 });
  
  const setUser = useAuthStore((s) => s.setUser);
  const setCompany = useCompanyStore((s) => s.setCompany);
  const clearCompany = useCompanyStore((s) => s.clearCompany);
  const [loggingOut, setLoggingOut] = useState(false);

  // Activate Tawk.to Chat Widget on this page
  useTawkTo();

  const companyName = company?.name || me?.company?.name || "your organization";

  // Sync company to store when me loads
  useEffect(() => {
    if (!me) return;
    if (isCompanyNotFound) {
      clearCompany();
      setUser({ company: undefined, role: undefined });
      return;
    }
    if (!company) {
      if (me.company?.id) {
        setCompany(me.company);
      } else if (me.companyId) {
        setCompany({ id: me.companyId, name: "" });
      }
    }
  }, [me, company, setCompany, isCompanyNotFound, clearCompany, setUser]);

  // Guard redirection logic:
  // 1. If user has no company: go to /create-company
  // 2. If user's subscription is active: go to /dashboard
  useEffect(() => {
    if (meLoading) return;
    const hasCompany = (me?.company?.id || me?.companyId || company?.id) && !isCompanyNotFound;
    if (!hasCompany) {
      navigate("/create-company", { replace: true });
      return;
    }

    if (subLoading) return;
    const isSubscriptionActive =
      subscription !== null &&
      subscription.isActive === true;

    if (isSubscriptionActive) {
      navigate("/dashboard", { replace: true });
    }
  }, [me, company, subscription, meLoading, subLoading, navigate]);

  const handleOpenChat = () => {
    const tawkApi = (window as any).Tawk_API;
    if (tawkApi && typeof tawkApi.maximize === "function") {
      try {
        tawkApi.maximize();
      } catch (err) {
        console.error(err);
        toast.error("Could not expand chat. Look for the chat widget in the bottom-right corner.");
      }
    } else {
      toast.success("Live chat widget is loading in the bottom-right corner. Click on it to start chatting.");
    }
  };

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await logoutApi();
    } catch (error) {
      console.error(error);
    } finally {
      clearAppSession();
      toast.success("Signed out");
      window.location.href = "/login";
    }
  };

  return (
    <AuthLayout>
      <AuthCard>
        <Box sx={{ mb: 3 }}>
          <Typography variant="h5" sx={{ fontWeight: 800, color: "text.primary", mb: 0.5 }}>
            Workspace Activation
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Your company is registered. Follow step 2 to activate your account.
          </Typography>
        </Box>

        {/* Custom Stepper */}
        <Box sx={{ width: "100%", mb: 4 }}>
          <Stepper activeStep={1} alternativeLabel sx={{
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

        <Divider sx={{ mb: 4 }} />

        {/* Status card */}
        <Card
          elevation={0}
          sx={{
            background: (theme) =>
              theme.palette.mode === "dark"
                ? "linear-gradient(135deg, rgba(30, 41, 59, 0.7), rgba(15, 23, 42, 0.8))"
                : "linear-gradient(135deg, rgba(255, 255, 255, 0.85), rgba(248, 250, 252, 0.95))",
            border: "1px solid",
            borderColor: "divider",
            borderRadius: "16px",
            p: 3,
            textAlign: "center",
            position: "relative",
            overflow: "hidden",
            mb: 4,
          }}
        >
          <CardContent sx={{ p: 0, display: "flex", flexDirection: "column", alignItems: "center" }}>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: 60,
                height: 60,
                borderRadius: "16px",
                background: "linear-gradient(135deg, rgba(139, 92, 246, 0.15) 0%, rgba(236, 72, 153, 0.15) 100%)",
                color: "primary.main",
                mb: 2.5,
                border: "1px solid rgba(139, 92, 246, 0.2)",
              }}
            >
              <MdLockOutline size={28} style={{ color: "#8B5CF6" }} />
            </Box>

            <Typography variant="h6" sx={{ fontWeight: 700, mb: 1, color: "text.primary" }}>
              Activation Required
            </Typography>

            <Typography variant="body2" color="text.secondary" sx={{ mb: 3, lineHeight: 1.6 }}>
              Thank you for registering <strong>{companyName}</strong>. Your workspace requires support activation to enable payroll modules and settings. Please contact our support team to activate your workspace instantly.
            </Typography>

            <Box sx={{ display: "flex", flexDirection: "column", width: "100%", gap: 1.5 }}>
              <Button
                variant="contained"
                startIcon={<MdChatBubble size={18} />}
                onClick={handleOpenChat}
                sx={{
                  background: "linear-gradient(135deg, #8B5CF6 0%, #6D28D9 100%)",
                  color: "#fff",
                  borderRadius: "10px",
                  textTransform: "none",
                  fontWeight: 600,
                  fontSize: "15px",
                  py: 1.25,
                  boxShadow: "0 4px 14px 0 rgba(139, 92, 246, 0.3)",
                  "&:hover": {
                    background: "linear-gradient(135deg, #7C3AED 0%, #5B21B6 100%)",
                    boxShadow: "0 6px 18px 0 rgba(139, 92, 246, 0.4)",
                  },
                }}
              >
                Chat with Support Now
              </Button>

              <Button
                variant="outlined"
                component="a"
                href="mailto:support@auronox.com?subject=Workspace%20Activation"
                startIcon={<MdEmail size={18} />}
                sx={{
                  borderRadius: "10px",
                  textTransform: "none",
                  fontWeight: 600,
                  fontSize: "14px",
                  py: 1.25,
                }}
              >
                Contact Support via Email
              </Button>
            </Box>
          </CardContent>
        </Card>

        <Divider sx={{ mb: 3 }} />

        <Box sx={{ display: "flex", justifyContent: "center" }}>
          <Button
            variant="text"
            color="secondary"
            onClick={handleLogout}
            disabled={loggingOut}
            sx={{ textTransform: "none", fontWeight: 600, fontSize: "14px" }}
          >
            {loggingOut ? "Signing out..." : "Sign out & switch account"}
          </Button>
        </Box>
      </AuthCard>
    </AuthLayout>
  );
}
