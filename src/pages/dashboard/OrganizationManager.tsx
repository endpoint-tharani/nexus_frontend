import { Suspense, lazy, useMemo } from "react";
import { Box, Paper, Tab, Tabs, Typography } from "@mui/material";
import { useLocation, useNavigate } from "react-router-dom";
import { MdAccountTree, MdBusiness } from "react-icons/md";

import { LoadingFallback } from "../../components/common";
import { CompanyRole } from "../../constants/enums";
import { useCurrentRole } from "../../hooks/user";

const Organization = lazy(() => import("./Organization"));
const Branches = lazy(() => import("./Branches"));
const Departments = lazy(() => import("./Departments"));

const MANAGER_TABS = [
  { id: "organization", label: "Organization", icon: MdBusiness, roles: [CompanyRole.OWNER, CompanyRole.ADMIN, CompanyRole.SUPER_ADMIN] },
  { id: "branches", label: "Branches", icon: MdBusiness, roles: [CompanyRole.OWNER, CompanyRole.ADMIN, CompanyRole.BRANCH_ADMIN, CompanyRole.SUPER_ADMIN] },
  { id: "departments", label: "Departments", icon: MdAccountTree, roles: [CompanyRole.OWNER, CompanyRole.ADMIN, CompanyRole.BRANCH_ADMIN, CompanyRole.DEPARTMENT_ADMIN, CompanyRole.SUPER_ADMIN] },
] as const;

export default function OrganizationManager() {
  const role = useCurrentRole();
  const location = useLocation();
  const navigate = useNavigate();
  const availableTabs = useMemo(() => MANAGER_TABS.filter((tab) => role && tab.roles.some((allowedRole) => allowedRole === role)), [role]);
  const requestedTab = new URLSearchParams(location.search).get("tab");
  const activeTab = availableTabs.find((tab) => tab.id === requestedTab)?.id
    ?? availableTabs[0]?.id
    ?? "";

  const selectTab = (_event: React.SyntheticEvent, tab: string) => {
    navigate(`/dashboard/organization-manager${tab === "organization" ? "" : `?tab=${tab}`}`, { replace: true });
  };

  return (
    <Box sx={{ maxWidth: 1440, mx: "auto", pb: 4 }}>
      <Box sx={{ mb: 3 }}>
        <Typography
          variant="overline"
          sx={{ color: "primary.main", fontWeight: 700, letterSpacing: "0.12em" }}
        >
          COMPANY STRUCTURE
        </Typography>
        <Typography
          component="h1"
          variant="h4"
          sx={{ mt: 0.25, fontWeight: 750, letterSpacing: "-0.035em" }}
        >
          Manage organization
        </Typography>
        <Typography color="text.secondary" sx={{ mt: 0.75, maxWidth: 640 }}>
          Keep your organization profile, branches, and departments organized in one place.
        </Typography>
      </Box>
      <Paper
        variant="outlined"
        sx={{
          mb: 3,
          px: { xs: 1, sm: 1.5 },
          borderRadius: 3,
          bgcolor: "background.paper",
          boxShadow: "0 2px 12px rgba(15, 23, 42, 0.04)",
        }}
      >
        <Tabs
          value={activeTab}
          onChange={selectTab}
          variant="scrollable"
          allowScrollButtonsMobile
          aria-label="Organization management sections"
          sx={{
            minHeight: 58,
            "& .MuiTabs-indicator": { height: 3, borderRadius: "3px 3px 0 0" },
            "& .MuiTab-root": {
              minHeight: 58,
              px: { xs: 1.5, sm: 2.5 },
              textTransform: "none",
              fontSize: "0.925rem",
              fontWeight: 600,
            },
            "& .MuiTab-iconWrapper": { fontSize: 19 },
          }}
        >
          {availableTabs.map(({ id, label, icon: Icon }) => (
            <Tab
              key={id}
              value={id}
              label={label}
              icon={<Icon />}
              iconPosition="start"
            />
          ))}
        </Tabs>
      </Paper>
      <Suspense fallback={<LoadingFallback />}>
        {activeTab === "organization" && <Organization />}
        {activeTab === "branches" && <Branches />}
        {activeTab === "departments" && <Departments />}
      </Suspense>
    </Box>
  );
}
