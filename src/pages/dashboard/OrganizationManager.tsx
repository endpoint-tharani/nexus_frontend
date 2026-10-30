import { Suspense, lazy, useEffect, useMemo, useState } from "react";
import { Box, Tab, Tabs, Typography } from "@mui/material";
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
  const [activeTab, setActiveTab] = useState(requestedTab ?? "organization");

  useEffect(() => {
    if (!availableTabs.some((tab) => tab.id === activeTab)) {
      setActiveTab(availableTabs[0]?.id ?? "");
    }
  }, [activeTab, availableTabs]);

  const selectTab = (_event: React.SyntheticEvent, tab: string) => {
    setActiveTab(tab);
    navigate(`/dashboard/organization-manager${tab === "organization" ? "" : `?tab=${tab}`}`, { replace: true });
  };

  return (
    <Box>
      <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>Manage Organization</Typography>
      <Typography color="text.secondary" sx={{ mb: 2 }}>Manage organization details, branches, and departments.</Typography>
      <Tabs value={activeTab} onChange={selectTab} variant="scrollable" allowScrollButtonsMobile sx={{ mb: 2, borderBottom: 1, borderColor: "divider" }}>
        {availableTabs.map(({ id, label, icon: Icon }) => <Tab key={id} value={id} label={label} icon={<Icon />} iconPosition="start" />)}
      </Tabs>
      <Suspense fallback={<LoadingFallback />}>
        {activeTab === "organization" && <Organization />}
        {activeTab === "branches" && <Branches />}
        {activeTab === "departments" && <Departments />}
      </Suspense>
    </Box>
  );
}
