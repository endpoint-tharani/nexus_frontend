import { useMemo, useState } from "react";
import type { MouseEvent } from "react";
import {
  Avatar,
  Box,
  Button,
  Chip,
  IconButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Tooltip,
  Typography,
  TextField,
  FormControl,
  Select,
  InputAdornment,
} from "@mui/material";
import SearchOutlined from "@mui/icons-material/SearchOutlined";
import PersonRemoveOutlined from "@mui/icons-material/PersonRemoveOutlined";
import MoreVertOutlined from "@mui/icons-material/MoreVertOutlined";
import FilterListOutlined from "@mui/icons-material/FilterListOutlined";
import toast from "react-hot-toast";
import type { ColumnDef } from "@tanstack/react-table";

import { SectionCard, DataTable, ConfirmDialog, StatusBadge } from "../ui";
import InviteStaffDialog from "./InviteStaffDialog";
import { useStaff, useRemoveStaff } from "../../hooks/company";
import { useMe } from "../../hooks/user";
import {
  COMPANY_ROLE_LABELS,
  COMPANY_ROLE_COLORS,
  CompanyRole,
} from "../../constants/enums";
import { getErrorMessage } from "../../utils/errorHandler";
import type { CompanyStaff } from "../../types";

export interface TeamManagementCardProps {
  canManage: boolean;
}

const initials = (name: string) => {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  const first = parts[0][0];
  const last = parts.length > 1 ? parts[parts.length - 1][0] : "";
  return (first + last).toUpperCase();
};

const AVATAR_BG: Record<CompanyRole, string> = {
  OWNER: "#16A34A",
  ADMIN: "#2563EB",
  BRANCH_ADMIN: "#0891B2",
  DEPARTMENT_ADMIN: "#0D9488",
  HR: "#7C3AED",
  EMPLOYEE: "#6B7280",
  SUPER_ADMIN: "#DC2626",
};

export default function TeamManagementCard({ canManage }: TeamManagementCardProps) {
  const { data: staff = [], isLoading, isError, refetch } = useStaff();
  const currentUserId = useMe().data?.id;
  const removeStaff = useRemoveStaff();

  const [inviteOpen, setInviteOpen] = useState(false);
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [menuTarget, setMenuTarget] = useState<CompanyStaff | null>(null);
  const [removeTarget, setRemoveTarget] = useState<CompanyStaff | null>(null);

  // Search and Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const closeMenu = () => {
    setMenuAnchor(null);
    setMenuTarget(null);
  };

  const openRemove = () => {
    setRemoveTarget(menuTarget);
    closeMenu();
  };

  const closeRemove = () => {
    if (removeStaff.isPending) return;
    setRemoveTarget(null);
  };

  const confirmRemove = () => {
    if (!removeTarget) return;
    const { name, id } = removeTarget;
    removeStaff.mutate(id, {
      onSuccess: () => {
        toast.success(`${name} was removed from company administrators`);
        setRemoveTarget(null);
      },
      onError: (error) => toast.error(getErrorMessage(error)),
    });
  };

  // Filtered staff list
  const filteredStaff = useMemo(() => {
    return staff.filter((m) => {
      const matchSearch =
        m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.email.toLowerCase().includes(searchQuery.toLowerCase());
      const matchRole = roleFilter === "ALL" || m.role === roleFilter;
      const isActive = m.isEmailVerified !== false;
      const matchStatus =
        statusFilter === "ALL" ||
        (statusFilter === "ACTIVE" && isActive) ||
        (statusFilter === "INVITED" && !isActive);

      return matchSearch && matchRole && matchStatus;
    });
  }, [staff, searchQuery, roleFilter, statusFilter]);

  const columns = useMemo<ColumnDef<CompanyStaff>[]>(
    () => [
      {
        id: "user",
        header: "USER",
        cell: ({ row }) => {
          const m = row.original;
          const isYou = m.id === currentUserId;
          return (
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
              <Avatar
                sx={{
                  width: 32,
                  height: 32,
                  fontSize: 12,
                  fontWeight: 700,
                  bgcolor: AVATAR_BG[m.role] ?? "#6B7280",
                  color: "#FFFFFF",
                }}
              >
                {initials(m.name)}
              </Avatar>

              <Box sx={{ minWidth: 0 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: "text.primary", fontSize: "13.5px" }} noWrap>
                    {m.name}
                  </Typography>
                  {isYou && (
                    <Chip
                      label="You"
                      size="small"
                      sx={{
                        height: 18,
                        fontSize: "10px",
                        fontWeight: 700,
                        bgcolor: "rgba(37, 99, 235, 0.12)",
                        color: "primary.main",
                        border: "none",
                      }}
                    />
                  )}
                </Box>
              </Box>
            </Box>
          );
        },
      },
      {
        accessorKey: "email",
        header: "EMAIL",
        cell: ({ row }) => (
          <Typography variant="body2" sx={{ color: "text.secondary", fontSize: "13.5px" }}>
            {row.original.email}
          </Typography>
        ),
      },
      {
        accessorKey: "role",
        header: "ROLE",
        cell: ({ row }) => {
          const m = row.original;
          return (
            <Chip
              size="small"
              label={COMPANY_ROLE_LABELS[m.role] ?? m.role}
              color={COMPANY_ROLE_COLORS[m.role] ?? "default"}
              variant={m.isOwner ? "filled" : "outlined"}
              sx={{ fontWeight: 600, fontSize: "11.5px" }}
            />
          );
        },
      },
      {
        id: "status",
        header: "STATUS",
        cell: ({ row }) => {
          const m = row.original;
          const isActive = m.isEmailVerified !== false;
          return (
            <StatusBadge
              label={isActive ? "Active" : "Invited"}
              type={isActive ? "success" : "warning"}
              variant="filled"
            />
          );
        },
      },
    ],
    [currentUserId]
  );

  const rowActions = useMemo(() => {
    if (!canManage) return undefined;
    return (member: CompanyStaff) => {
      if (member.isOwner || member.id === currentUserId) return null;
      return (
        <Tooltip title="Manage administrator">
          <IconButton
            size="small"
            aria-label={`Manage ${member.name}`}
            onClick={(e: MouseEvent<HTMLElement>) => {
              setMenuAnchor(e.currentTarget);
              setMenuTarget(member);
            }}
            sx={{ color: "text.secondary", "&:hover": { color: "text.primary" } }}
          >
            <MoreVertOutlined sx={{ fontSize: 18 }} />
          </IconButton>
        </Tooltip>
      );
    };
  }, [canManage, currentUserId]);

  return (
    <SectionCard
      title="Company Administrators"
      subtitle="Authorized personnel with administrative rights to manage TDS compliance and company settings."
      actions={
        canManage && (
          <Button
            size="small"
            onClick={() => setInviteOpen(true)}
            sx={{
              p: 0,
              fontSize: "13px",
              fontWeight: 600,
              color: "primary.main",
              textTransform: "none",
              "&:hover": { bgcolor: "transparent", textDecoration: "underline" },
            }}
          >
            + Invite Administrator
          </Button>
        )
      }
    >
      {/* Filters Toolbar */}
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          gap: 1.5,
          mb: 2,
          width: "100%",
        }}
      >
        <TextField
          placeholder="Search administrators..."
          size="small"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchOutlined sx={{ fontSize: 18, color: "text.secondary" }} />
                </InputAdornment>
              ),
            },
          }}
          sx={{
            flexGrow: 1,
            "& .MuiOutlinedInput-root": {
              height: "36px",
              borderRadius: "6px",
              fontSize: "13px",
              "& fieldset": { borderColor: "divider" },
            },
          }}
        />

        <FormControl size="small" sx={{ minWidth: 140 }}>
          <Select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            startAdornment={
              <InputAdornment position="start" sx={{ pl: 0.5 }}>
                <FilterListOutlined sx={{ fontSize: 15, color: "text.secondary" }} />
              </InputAdornment>
            }
            sx={{
              height: "36px",
              borderRadius: "6px",
              fontSize: "13px",
              "& .MuiOutlinedInput-notchedOutline": { borderColor: "divider" },
            }}
          >
            <MenuItem value="ALL">All Roles</MenuItem>
            <MenuItem value="OWNER">Owner</MenuItem>
            <MenuItem value="ADMIN">Company Admin</MenuItem>
            <MenuItem value="HR">HR Admin</MenuItem>
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 130 }}>
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            sx={{
              height: "36px",
              borderRadius: "6px",
              fontSize: "13px",
              "& .MuiOutlinedInput-notchedOutline": { borderColor: "divider" },
            }}
          >
            <MenuItem value="ALL">All Status</MenuItem>
            <MenuItem value="ACTIVE">Active</MenuItem>
            <MenuItem value="INVITED">Invited</MenuItem>
          </Select>
        </FormControl>
      </Box>

      <DataTable
        columns={columns}
        data={filteredStaff}
        loading={isLoading}
        error={isError ? "Couldn't load company administrators." : null}
        onRetry={() => refetch()}
        rowActions={rowActions}
        emptyTitle="No company administrators found"
        emptyDescription="Try adjusting your search criteria or role filter."
        ariaLabel="Company administrators"
        enablePagination={filteredStaff.length > 8}
      />

      {canManage && (
        <>
          <InviteStaffDialog open={inviteOpen} onClose={() => setInviteOpen(false)} />

          <Menu
            anchorEl={menuAnchor}
            open={Boolean(menuAnchor)}
            onClose={closeMenu}
            anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
            transformOrigin={{ vertical: "top", horizontal: "right" }}
            slotProps={{ paper: { sx: { borderRadius: "6px", bgcolor: "background.paper", border: "1px solid", borderColor: "divider", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)" } } }}
          >
            <MenuItem onClick={openRemove} sx={{ color: "error.main" }}>
              <ListItemIcon sx={{ color: "inherit", minWidth: 30 }}>
                <PersonRemoveOutlined sx={{ fontSize: 17 }} />
              </ListItemIcon>
              <ListItemText
                primary={
                  <Typography sx={{ fontSize: "13px", fontWeight: 500 }}>
                    Revoke Administrator Access
                  </Typography>
                }
              />
            </MenuItem>
          </Menu>

          <ConfirmDialog
            open={Boolean(removeTarget)}
            title="Revoke Administrator Access"
            message={
              removeTarget ? (
                <>
                  Are you sure you want to remove administrative privileges for <strong>{removeTarget.name}</strong>?
                </>
              ) : undefined
            }
            confirmLabel="Revoke Access"
            severity="error"
            loading={removeStaff.isPending}
            onConfirm={confirmRemove}
            onClose={closeRemove}
          />
        </>
      )}
    </SectionCard>
  );
}
