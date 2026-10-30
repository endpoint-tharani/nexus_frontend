import { Fragment, useEffect, useMemo, useState } from "react";
import { Outlet, useNavigate, useLocation, Link } from "react-router-dom";
import {
  Box,
  Chip,
  Collapse,
  Drawer,
  FormControl,
  InputAdornment,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  MenuItem,
  OutlinedInput,
  Select,
  Typography,
  IconButton,
  Divider,
  Tooltip,
  Button,
  Alert,
  CircularProgress,
  Paper,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import {
  MdBusiness,
  MdMenu,
  MdClose,
  MdChevronLeft,
  MdNotificationsNone,
  MdExpandMore,
  MdAdd,
  MdSearch,
} from "react-icons/md";
import toast from "react-hot-toast";

import ProfileMenu from "./profile/ProfileMenu";
import type { ProfileMenuItem } from "./profile/ProfileMenu";
import type { ModuleMenuItem } from "../../modules/types";
import PageContainer from "./PageContainer";
import { CommandPalette } from "../ui";
import { Logo, ThemeSwitcher } from "../common";
import { useAuthStore } from "../../store/auth.store";
import { useCompanyStore } from "../../store/company.store";
import { useMe } from "../../hooks/user";
import { useCompany } from "../../hooks/company";
import { useActiveBranch } from "../../hooks/branch";
import { useBranchStore } from "../../store/branch.store";
import { CompanyRole } from "../../constants/enums";
import { useSidebar, usePageTitle } from "../../core/navigation";
import { logout as logoutApi } from "../../api/auth.api";
import { clearAppSession } from "../../utils/logout";
import { layout } from "../../theme";

const { drawerFull: DRAWER_FULL, drawerMini: DRAWER_MINI, topbarHeight: TOPBAR_H } = layout;

// Brand lockup — the official Auronox artwork from /public. Collapses to the
// standalone mark when the sidebar is in its mini state.
function Brand({ compact = false }: { compact?: boolean }) {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  return (
    <Box sx={{ display: "flex", alignItems: "center", minWidth: 0 }}>
      {compact ? <Logo markOnly size={32} /> : <Logo size={28} onDark={isDark} />}
    </Box>
  );
}

export default function DashboardLayout() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  // Which collapsible nav groups are expanded.
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});
  const [pendingBranchId, setPendingBranchId] = useState("");

  const navigate = useNavigate();
  const location = useLocation();

  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);
  const company = useCompanyStore((s) => s.company);
  const setCompany = useCompanyStore((s) => s.setCompany);

  const { data: me, isLoading: meLoading } = useMe();
  const { branches, selectedBranchId, selectBranch, isLoading: branchesLoading, error: branchesError, refetch: refetchBranches } = useActiveBranch();
  const requestBranchCreate = useBranchStore((state) => state.requestBranchCreate);

  const { sections, accountItems } = useSidebar();
  const pageTitle = usePageTitle(location.pathname);
  const organizationId = me?.company?.id ?? me?.companyId ?? company?.id ?? "";
  const { data: organizationDetails, isLoading: organizationLoading } = useCompany({ enabled: Boolean(organizationId) });
  const organizationName = organizationDetails?.name || me?.company?.name || company?.name || (organizationLoading ? "Loading organization…" : "Organization");
  const selectionRequired = meLoading || (Boolean(organizationId) && !selectedBranchId);

  // A single authorized branch is unambiguous, so restore a usable session
  // without asking the user to make a redundant selection.
  useEffect(() => {
    if (
      organizationId &&
      !branchesLoading &&
      !branchesError &&
      !selectedBranchId &&
      branches.length === 1
    ) {
      selectBranch(branches[0].id);
    }
  }, [organizationId, branches, branchesLoading, branchesError, selectedBranchId, selectBranch]);

  // 1. Synchronize profile details into local state stores only when values actually change
  useEffect(() => {
    if (!me) return;

    const patch: {
      role?: typeof me.role;
      company?: typeof me.company;
      branchId?: typeof me.branchId;
      departmentId?: typeof me.departmentId;
    } = {};
    if (me.role && me.role !== user?.role) {
      patch.role = me.role;
    }
    if (me.company && me.company.id !== user?.company?.id) {
      patch.company = me.company;
    }
    if (me.branchId !== user?.branchId) patch.branchId = me.branchId;
    if (me.departmentId !== user?.departmentId) patch.departmentId = me.departmentId;
    if (Object.keys(patch).length > 0) {
      setUser(patch);
    }

    if (!company && (me.company?.id || me.companyId)) {
      if (me.company?.id) {
        setCompany(me.company);
      } else if (me.companyId) {
        setCompany({ id: me.companyId, name: "" });
      }
    }
  }, [
    me,
    company,
    user?.role,
    user?.company?.id,
    user?.branchId,
    user?.departmentId,
    setCompany,
    setUser,
  ]);

  // 2. Navigation guards for onboarding
  useEffect(() => {
    if (!me) return;

    const isSuperAdmin = user?.role === "SUPER_ADMIN" || me.role === "SUPER_ADMIN";
    if (isSuperAdmin) return;

    const hasCompany = me.company?.id || me.companyId || company?.id;
    if (!hasCompany) {
      navigate("/create-company", { replace: true });
      return;
    }
  }, [me, company, navigate, user?.role]);

  // Global Ctrl+K listener
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setPaletteOpen((o) => !o);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const miniSidebar = collapsed && !isMobile;
  const drawerWidth = miniSidebar ? DRAWER_MINI : DRAWER_FULL;

  const accountMenuItems: ProfileMenuItem[] = accountItems.map((item) => ({
    label: item.label,
    path: item.path,
    icon: item.icon,
  }));

  const handleLogout = async () => {
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

  const isActive = (path: string) =>
    path === "/dashboard"
      ? location.pathname === "/dashboard"
      : location.pathname === path || location.pathname.startsWith(path + "/");

  const toggleGroup = (label: string) =>
    setOpenGroups((prev) => ({ ...prev, [label]: !prev[label] }));

  const activeSectionLabel = useMemo(() => {
    const matches = (path: string) =>
      path === "/dashboard"
        ? location.pathname === "/dashboard"
        : location.pathname === path || location.pathname.startsWith(path + "/");
    const match = sections.find(
      (s) => s.label && s.items.length > 1 && s.items.some((it) => matches(it.path))
    );
    return match?.label;
  }, [sections, location.pathname]);

  // A single clickable nav entry. `nested` indents it under a group header.
  const renderNavItem = (item: ModuleMenuItem, nested = false) => {
    const active = isActive(item.path);
    const Icon = item.icon;
    return (
      <ListItemButton
        key={item.path}
        component={Link}
        to={item.path}
        selected={active}
        aria-current={active ? "page" : undefined}
        onClick={() => isMobile && setMobileOpen(false)}
        sx={{
          px: 1.5,
          pl: nested ? 4.5 : 1.5,
          justifyContent: "flex-start",
          borderRadius: "8px",
          mb: 0.25,
          position: "relative",
          // Left-border accent on active items
          "&.Mui-selected": {
            bgcolor: "rgba(37, 99, 235, 0.08)",
            color: "primary.main",
            "&::before": {
              content: '""',
              position: "absolute",
              left: 0,
              top: "20%",
              bottom: "20%",
              width: "3px",
              borderRadius: "0 2px 2px 0",
              bgcolor: "primary.main",
            },
            "&:hover": {
              bgcolor: "rgba(37, 99, 235, 0.12)",
            },
          },
          "&:hover": {
            bgcolor: "rgba(15, 23, 42, 0.04)",
          },
        }}
      >
        <ListItemIcon
          sx={{
            minWidth: nested ? 30 : 36,
            color: active ? "primary.main" : "text.secondary",
          }}
        >
          <Icon size={nested ? 17 : 19} />
        </ListItemIcon>
        <ListItemText
          primary={item.label}
          slotProps={{
            primary: {
              sx: {
                fontSize: "0.875rem",
                fontWeight: active ? 600 : 500,
                color: active ? "primary.main" : "text.primary",
              },
            },
          }}
        />
      </ListItemButton>
    );
  };

  // Icon-only entry for the mini (collapsed) sidebar, with a hover tooltip.
  const renderMiniItem = (item: ModuleMenuItem) => {
    const active = isActive(item.path);
    const Icon = item.icon;
    return (
      <Tooltip key={item.path} title={item.label} placement="right">
        <span>
          <ListItemButton
            component={Link}
            to={item.path}
            selected={active}
            aria-current={active ? "page" : undefined}
            onClick={() => isMobile && setMobileOpen(false)}
            sx={{
              px: 1.5,
              justifyContent: "center",
              borderRadius: "8px",
              mb: 0.25,
              "&.Mui-selected": {
                bgcolor: "rgba(37, 99, 235, 0.10)",
                color: "primary.main",
              },
            }}
          >
            <ListItemIcon sx={{ minWidth: 0, color: active ? "primary.main" : "text.secondary" }}>
              <Icon size={20} />
            </ListItemIcon>
          </ListItemButton>
        </span>
      </Tooltip>
    );
  };

  const displayName = me?.name ?? user?.name;
  const displayEmail = me?.email ?? user?.email;
  const role = me?.role ?? user?.role;
  const canManageBranches =
    role === CompanyRole.OWNER ||
    role === CompanyRole.ADMIN;

  const drawerContent = (
    <Box sx={{ height: "100%", display: "flex", flexDirection: "column", overflow: "hidden" }}>
      {/* Brand row */}
      <Box
        sx={{
          px: miniSidebar ? 1 : 2.5,
          display: "flex",
          alignItems: "center",
          justifyContent: miniSidebar ? "center" : "space-between",
          minHeight: TOPBAR_H,
        }}
      >
        {miniSidebar ? (
          <Tooltip title="Expand sidebar" placement="right">
            <Box
              component="button"
              type="button"
              onClick={() => setCollapsed(false)}
              aria-label="Expand sidebar"
              sx={{
                p: 0,
                border: 0,
                background: "none",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
              }}
            >
              <Brand compact />
            </Box>
          </Tooltip>
        ) : (
          <Brand />
        )}
        {!isMobile && !miniSidebar && (
          <IconButton onClick={() => setCollapsed(true)} size="small" aria-label="Collapse sidebar">
            <MdChevronLeft size={18} />
          </IconButton>
        )}
        {isMobile && (
          <IconButton onClick={() => setMobileOpen(false)} size="small" aria-label="Close navigation menu">
            <MdClose size={18} />
          </IconButton>
        )}
      </Box>

      <Divider />

      {/* Navigation */}
      <List
        component="nav"
        aria-label="Main navigation"
        sx={{ pl: miniSidebar ? 0.75 : 1, pr: 0.75, pt: 1.5, flexGrow: 1, overflowY: "auto" }}
      >
        {sections.map((section, sectionIndex) => {
          const key = section.label || `section-${sectionIndex}`;

          if (miniSidebar) {
            return (
              <Fragment key={key}>
                {sectionIndex > 0 && <Divider sx={{ my: 0.75 }} />}
                {section.items.map(renderMiniItem)}
              </Fragment>
            );
          }

          if (!section.label || section.items.length <= 1) {
            return (
              <Fragment key={key}>
                {section.items.map((item) => renderNavItem(item))}
              </Fragment>
            );
          }

          const open = openGroups[section.label] ?? section.label === activeSectionLabel;
          const groupActive = section.items.some((it) => isActive(it.path));
          const SectionIcon = section.icon;

          return (
            <Fragment key={key}>
              {/* Section label / group header */}
              {sectionIndex > 0 && <Box sx={{ mt: 1.5 }} />}
              {SectionIcon ? (
                <ListItemButton
                  onClick={() => toggleGroup(section.label)}
                  aria-expanded={open}
                  sx={{
                    px: 1.5,
                    borderRadius: "8px",
                    mb: 0.25,
                    color: groupActive ? "primary.main" : "text.primary",
                    "&:hover": { bgcolor: "rgba(15, 23, 42, 0.04)" },
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 36, color: "inherit" }}>
                    <SectionIcon size={19} />
                  </ListItemIcon>
                  <ListItemText
                    primary={section.label}
                    slotProps={{
                      primary: {
                        sx: { fontSize: "0.875rem", fontWeight: groupActive ? 600 : 500 },
                      },
                    }}
                  />
                  <MdExpandMore
                    size={16}
                    style={{
                      flexShrink: 0,
                      transition: "transform 0.2s ease",
                      transform: open ? "rotate(180deg)" : "rotate(0deg)",
                      color: "#94A3B8",
                    }}
                  />
                </ListItemButton>
              ) : (
                <Typography
                  variant="caption"
                  sx={{
                    px: 1.5,
                    mb: 0.5,
                    display: "block",
                    fontWeight: 700,
                    fontSize: "0.7rem",
                    letterSpacing: "0.07em",
                    textTransform: "uppercase",
                    color: "text.disabled",
                  }}
                >
                  {section.label}
                </Typography>
              )}

              <Collapse in={SectionIcon ? open : true} timeout="auto" unmountOnExit>
                <List component="div" disablePadding>
                  {section.items.map((item) => renderNavItem(item, Boolean(SectionIcon)))}
                </List>
              </Collapse>
            </Fragment>
          );
        })}
      </List>

      <Divider />

      {/* Footer: account avatar + menu */}
      <Box sx={{ p: miniSidebar ? 1 : 1.5 }}>
        <ProfileMenu
          name={displayName}
          email={displayEmail}
          items={accountMenuItems}
          onLogout={handleLogout}
          compact={miniSidebar}
        />
      </Box>
    </Box>
  );

  // Topbar right-hand controls
  const topbarControls = (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: { xs: "flex-end", md: "initial" },
        width: { xs: "100%", md: "auto" },
        gap: { xs: 0.5, sm: 1 },
      }}
    >
      {/* Ctrl+K search trigger */}
      <Tooltip title={<>Search <Chip label="Ctrl K" size="small" sx={{ height: 16, fontSize: "0.65rem", ml: 0.5, bgcolor: "rgba(255,255,255,0.15)", color: "inherit" }} /></>}>
        <IconButton
          onClick={() => setPaletteOpen(true)}
          size="small"
          aria-label="Open command palette (Ctrl+K)"
          sx={{
            borderRadius: "8px",
            border: "1px solid",
            borderColor: "divider",
            px: 1,
            py: 0.5,
            gap: 0.75,
            display: { xs: "flex", sm: "none" },
          }}
        >
          <MdSearch size={18} />
        </IconButton>
      </Tooltip>

      {/* Wide search bar — desktop only */}
      <Box
        component="button"
        onClick={() => setPaletteOpen(true)}
        aria-label="Open command palette"
        sx={{
          display: { xs: "none", sm: "flex" },
          alignItems: "center",
          gap: 1,
          px: 1.5,
          py: 0.625,
          border: "1px solid",
          borderColor: "divider",
          borderRadius: "8px",
          bgcolor: "background.default",
          cursor: "pointer",
          color: "text.secondary",
          fontSize: "0.8125rem",
          fontFamily: "inherit",
          fontWeight: 400,
          minWidth: 200,
          transition: "border-color 0.15s ease, box-shadow 0.15s ease",
          "&:hover": {
            borderColor: "#CBD5E1",
            boxShadow: "0 0 0 3px rgba(37,99,235,0.06)",
          },
        }}
      >
        <MdSearch size={16} />
        <Box component="span" sx={{ flex: 1, textAlign: "left" }}>
          Search…
        </Box>
        <Chip
          label="Ctrl K"
          size="small"
          sx={{
            height: 18,
            fontSize: "0.68rem",
            fontWeight: 500,
            bgcolor: "#F1F5F9",
            color: "text.disabled",
            borderRadius: "4px",
          }}
        />
      </Box>

      {branches.length > 0 && (
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
          <FormControl size="small" sx={{ width: { xs: 128, sm: 180, md: 210 } }}>
            <Select
              value={selectedBranchId}
              disabled={branches.length < 2}
              onChange={(event) => selectBranch(event.target.value)}
              input={
                <OutlinedInput
                  startAdornment={
                    <InputAdornment position="start">
                      <MdBusiness size={17} />
                    </InputAdornment>
                  }
                  sx={{ height: 38, borderRadius: 2, fontSize: "0.8125rem" }}
                />
              }
              inputProps={{ "aria-label": "Switch branch" }}
              renderValue={(branchId) =>
                branches.find((branch) => branch.id === branchId)?.name ?? "Select branch"
              }
              sx={{
                "& .MuiSelect-select": {
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  py: 0.75,
                },
              }}
            >
              {branches.map((branch) => (
                <MenuItem key={branch.id} value={branch.id}>
                  {branch.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          {canManageBranches && (
            <Tooltip title="Add branch">
              <IconButton
                size="small"
                aria-label="Add branch"
                onClick={() => {
                  requestBranchCreate();
                  navigate("/dashboard/organization-manager?tab=branches");
                }}
                sx={{
                  width: 36,
                  height: 36,
                  border: "1px solid",
                  borderColor: "divider",
                  borderRadius: 2,
                }}
              >
                <MdAdd size={19} />
              </IconButton>
            </Tooltip>
          )}
        </Box>
      )}

      <Tooltip title="Notifications">
        <span>
          <IconButton aria-label="Notifications" disabled>
            <MdNotificationsNone size={22} />
          </IconButton>
        </span>
      </Tooltip>

      <ThemeSwitcher />
    </Box>
  );

  if (selectionRequired) {
    const canContinue = Boolean(organizationId && pendingBranchId) &&
      branches.some((branch) => branch.id === pendingBranchId);

    return (
      <Box sx={{ minHeight: "100vh", bgcolor: "#f7f9fc", display: "grid", placeItems: "center", px: 2, py: 4 }}>
        <Paper elevation={0} sx={{ width: "100%", maxWidth: 560, p: { xs: 2.5, sm: 4 }, border: "1px solid", borderColor: "#dce3eb", borderRadius: 3, boxShadow: "0 2px 4px rgba(15, 23, 42, 0.08)" }}>
          <Box sx={{ display: "flex", justifyContent: "center", mb: 3 }}><Logo size={30} /></Box>
          <Box sx={{ textAlign: "center", mb: 3.5 }}>
            <Box sx={{ mx: "auto", mb: 2, width: 56, height: 56, borderRadius: 2, bgcolor: "#edf6ff", color: "primary.main", display: "grid", placeItems: "center" }}><MdBusiness size={28} /></Box>
            <Typography variant="h5" sx={{ fontWeight: 700 }}>Select organization and branch</Typography>
            <Typography color="text.secondary" sx={{ mt: 0.75 }}>Pick where you&apos;re working for this session.</Typography>
          </Box>

          <Box sx={{ p: 1.5, border: "1px solid", borderColor: "divider", borderRadius: 2, mb: 1.5, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 2 }}>
            <Box><Typography variant="caption" color="text.secondary">Signed in as</Typography><Typography variant="body2" sx={{ fontWeight: 600 }}>{me?.email ?? user?.email ?? ""}</Typography></Box>
            <Button size="small" variant="outlined" onClick={() => void handleLogout()}>Sign out</Button>
          </Box>
          <Alert severity="info" sx={{ mb: 2.5 }}>Your workspace data is scoped to the branch you choose. You can switch branches from the header at any time.</Alert>

          <FormControl fullWidth size="small" sx={{ mb: 2 }}>
            <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.75 }}>Organization *</Typography>
            <OutlinedInput
              value={organizationName}
              readOnly
              inputProps={{ "aria-label": "Organization", readOnly: true }}
              startAdornment={<InputAdornment position="start"><MdBusiness size={17} /></InputAdornment>}
              sx={{ bgcolor: "action.hover" }}
            />
          </FormControl>
          <FormControl fullWidth size="small" sx={{ mb: 2.5 }} disabled={!organizationId || branchesLoading || Boolean(branchesError) || branches.length === 0}>
            <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.75 }}>Branch *</Typography>
            {branchesError ? (
              <Alert severity="error" action={<Button color="inherit" size="small" onClick={() => void refetchBranches()}>Retry</Button>}>Branches could not be loaded.</Alert>
            ) : branchesLoading ? (
              <Box sx={{ minHeight: 40, display: "flex", alignItems: "center", gap: 1, color: "text.secondary" }}><CircularProgress size={18} />Loading branches…</Box>
            ) : branches.length === 0 ? (
              <Alert severity="info">No accessible branches are available for this organization.</Alert>
            ) : (
              <Select displayEmpty value={pendingBranchId} onChange={(event) => setPendingBranchId(event.target.value)}>
                <MenuItem value="" disabled>Select branch</MenuItem>
                {branches.map((branch) => <MenuItem key={branch.id} value={branch.id}>{branch.name}</MenuItem>)}
              </Select>
            )}
          </FormControl>
          <Button fullWidth variant="contained" size="large" disabled={!canContinue} onClick={() => {
            setCompany({ id: organizationId, name: organizationName });
            selectBranch(pendingBranchId);
          }}>Continue</Button>
        </Paper>
      </Box>
    );
  }

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "background.default" }}>
      {/* Mobile Drawer */}
      {isMobile && (
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
          ModalProps={{ keepMounted: true }}
          sx={{ "& .MuiDrawer-paper": { width: DRAWER_FULL } }}
        >
          {drawerContent}
        </Drawer>
      )}

      {/* Desktop Drawer */}
      {!isMobile && (
        <Drawer
          variant="permanent"
          sx={{
            width: drawerWidth,
            flexShrink: 0,
            transition: "width 0.2s ease",
            "& .MuiDrawer-paper": {
              width: drawerWidth,
              transition: "width 0.2s ease",
              overflowX: "hidden",
            },
          }}
        >
          {drawerContent}
        </Drawer>
      )}

      {/* Main column */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          display: "flex",
          flexDirection: "column",
          minHeight: "100vh",
          minWidth: 0,
        }}
      >
        {/* Topbar */}
        <Box
          sx={{
            position: "sticky",
            top: 0,
            zIndex: (t) => t.zIndex.appBar,
            px: { xs: 2, sm: 3 },
            minHeight: TOPBAR_H,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 2,
            flexWrap: { xs: "wrap", md: "nowrap" },
            py: { xs: 1, md: 0 },
            borderBottom: "1px solid",
            borderColor: "divider",
            bgcolor: "background.paper",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, minWidth: 0 }}>
            {isMobile && (
              <IconButton
                onClick={() => setMobileOpen(true)}
                size="small"
                aria-label="Open navigation menu"
                edge="start"
              >
                <MdMenu size={22} />
              </IconButton>
            )}
            <Box sx={{ minWidth: 0 }}>
              <Typography variant="subtitle1" noWrap sx={{ fontWeight: 700, lineHeight: 1.2 }}>
                {pageTitle}
              </Typography>
            </Box>
          </Box>

          {topbarControls}
        </Box>

        {/* Routed page content */}
        <Box sx={{ flexGrow: 1, minHeight: 0 }}>
          <PageContainer>
            <Outlet />
          </PageContainer>
        </Box>
      </Box>

      {/* Global Command Palette */}
      <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} />

    </Box>
  );
}
