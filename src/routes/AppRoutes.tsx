import { lazy, Suspense } from "react";
import type { ReactNode } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import DashboardLayout from "../components/dashboard/dashboardlayout";
import { ErrorBoundary, LoadingFallback } from "../components/common";
import RoleGuard from "../components/guards/RoleGuard";
import { useAuthStore } from "../store/auth.store";

const Login = lazy(() => import("../pages/auth/Login"));
const Register = lazy(() => import("../pages/auth/Register"));
const VerifyEmail = lazy(() => import("../pages/auth/VerifyEmail"));
const ForgotPassword = lazy(() => import("../pages/auth/ForgotPassword"));
const ResetPassword = lazy(() => import("../pages/auth/ResetPassword"));
const RequestLoginOtp = lazy(() => import("../pages/auth/RequestLoginOtp"));
const VerifyLoginOtp = lazy(() => import("../pages/auth/VerifyLoginOtp"));
const AcceptStaffInvite = lazy(() => import("../pages/auth/AcceptStaffInvite"));
const AcceptInvite = lazy(() => import("../pages/auth/AcceptInvite"));
const CreateCompany = lazy(() => import("../pages/auth/CreateCompany"));

const Dashboard = lazy(() => import("../pages/dashboard/Dashboard"));
const OrganizationManager = lazy(() => import("../pages/dashboard/OrganizationManager"));
const Profile = lazy(() => import("../pages/dashboard/Profile"));
const Sessions = lazy(() => import("../pages/dashboard/Sessions"));
const NotFound = lazy(() => import("../pages/NotFound"));

function ProtectedRoute({ children }: { children: ReactNode }) {
  const accessToken = useAuthStore((state) => state.accessToken);
  return accessToken ? <>{children}</> : <Navigate to="/login" replace />;
}

function GuestRoute({ children }: { children: ReactNode }) {
  const accessToken = useAuthStore((state) => state.accessToken);
  return !accessToken ? <>{children}</> : <Navigate to="/dashboard" replace />;
}

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <ErrorBoundary>
        <Suspense fallback={<LoadingFallback />}>
          <Routes>
            <Route path="/login" element={<GuestRoute><Login /></GuestRoute>} />
            <Route path="/register" element={<GuestRoute><Register /></GuestRoute>} />
            <Route path="/verify-email" element={<GuestRoute><VerifyEmail /></GuestRoute>} />
            <Route path="/forgot-password" element={<GuestRoute><ForgotPassword /></GuestRoute>} />
            <Route path="/reset-password" element={<GuestRoute><ResetPassword /></GuestRoute>} />
            <Route path="/login-otp" element={<GuestRoute><RequestLoginOtp /></GuestRoute>} />
            <Route path="/verify-login-otp" element={<GuestRoute><VerifyLoginOtp /></GuestRoute>} />

            <Route path="/accept-staff-invite" element={<AcceptStaffInvite />} />
            <Route path="/auth/accept-staff-invite" element={<AcceptStaffInvite />} />
            <Route path="/accept-invite" element={<AcceptInvite />} />
            <Route path="/auth/accept-invite" element={<AcceptInvite />} />

            <Route path="/create-company" element={<ProtectedRoute><CreateCompany /></ProtectedRoute>} />

            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Dashboard />} />
              <Route path="organization-manager" element={<RoleGuard><OrganizationManager /></RoleGuard>} />
              <Route path="organization" element={<Navigate to="/dashboard/organization-manager" replace />} />
              <Route path="branches" element={<Navigate to="/dashboard/organization-manager?tab=branches" replace />} />
              <Route path="departments" element={<Navigate to="/dashboard/organization-manager?tab=departments" replace />} />
              <Route path="company" element={<Navigate to="/dashboard/organization" replace />} />
              <Route path="profile" element={<Profile />} />
              <Route path="sessions" element={<Sessions />} />
              <Route path="*" element={<NotFound embedded />} />
            </Route>

            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </ErrorBoundary>
    </BrowserRouter>
  );
}
