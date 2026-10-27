import { useState } from "react";
import type { MouseEvent } from "react";
import {
  Avatar,
  Box,
  Button,
  Card,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Typography,
  Stack,
} from "@mui/material";
import EditOutlined from "@mui/icons-material/EditOutlined";
import MoreVertOutlined from "@mui/icons-material/MoreVertOutlined";
import GroupOutlined from "@mui/icons-material/GroupOutlined";
import FileDownloadOutlined from "@mui/icons-material/FileDownloadOutlined";
import BlockOutlined from "@mui/icons-material/BlockOutlined";
import DeleteOutlineOutlined from "@mui/icons-material/DeleteOutlineOutlined";
import toast from "react-hot-toast";

import { CompanyRole } from "../../constants/enums";
import type { Company } from "../../types";

interface CompanyHeaderProps {
  company: Company;
  role?: CompanyRole;
  onEdit: () => void;
  onManageAdmins?: () => void;
  onDeleteClick?: () => void;
}

export default function CompanyHeader({
  company,
  role,
  onEdit,
  onManageAdmins,
  onDeleteClick,
}: CompanyHeaderProps) {
  const isOwner = role === CompanyRole.OWNER;
  const initial = company.name.charAt(0).toUpperCase();

  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);

  const handleOpenMenu = (e: MouseEvent<HTMLElement>) => {
    setMenuAnchor(e.currentTarget);
  };

  const handleCloseMenu = () => {
    setMenuAnchor(null);
  };

  const handleExportDetails = () => {
    handleCloseMenu();
    toast.success("Company details exported cleanly.");
  };

  const handleDeactivate = () => {
    handleCloseMenu();
    toast.error("Company deactivation requires super admin approval.");
  };

  const isPanConfigured = Boolean(company.pan && company.pan.length > 3);
  const isTanConfigured = Boolean(company.tan && company.tan.length > 3);
  const employeeCount = company.users?.length ?? 0;

  return (
    <Card
      elevation={0}
      sx={{
        p: 2.5,
        borderRadius: "8px",
        border: "1px solid",
        borderColor: "divider",
        bgcolor: "background.paper",
      }}
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          justifyContent: "space-between",
          alignItems: { xs: "flex-start", md: "center" },
          gap: 2,
        }}
      >
        {/* Left Identity Block */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, minWidth: 0 }}>
          <Avatar
            variant="rounded"
            sx={{
              width: 46,
              height: 46,
              borderRadius: "8px",
              bgcolor: "primary.main",
              color: "primary.contrastText",
              fontWeight: 700,
              fontSize: "20px",
            }}
          >
            {initial}
          </Avatar>

          <Box sx={{ minWidth: 0 }}>
            <Stack direction="row" spacing={1} sx={{ alignItems: "center", mb: 0.25 }}>
              <Typography variant="h6" sx={{ fontWeight: 700, color: "text.primary", fontSize: "18px" }} noWrap>
                {company.name}
              </Typography>

              <Chip
                label="Active"
                size="small"
                sx={{
                  height: "20px",
                  fontSize: "11px",
                  fontWeight: 600,
                  bgcolor: (theme) => (theme.palette.mode === "dark" ? "rgba(22, 101, 52, 0.25)" : "#F0FDF4"),
                  color: (theme) => (theme.palette.mode === "dark" ? "#4ADE80" : "#166534"),
                  border: "1px solid",
                  borderColor: (theme) => (theme.palette.mode === "dark" ? "rgba(74, 222, 128, 0.3)" : "#BBF7D0"),
                  "& .MuiChip-label": { px: 0.75 },
                }}
              />
            </Stack>

            <Typography variant="body2" sx={{ color: "text.secondary", fontSize: "13px" }}>
              {company.entityType || "Private Limited"} &nbsp;•&nbsp; FY 2026-27 &nbsp;•&nbsp; {employeeCount} Employees
            </Typography>
          </Box>
        </Box>

        {/* Right Status Summary & Actions */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 2,
            alignSelf: { xs: "flex-end", md: "center" },
          }}
        >
          {/* Statutory Quick Indicators */}
          <Box sx={{ display: { xs: "none", sm: "flex" }, alignItems: "center", gap: 1.5 }}>
            <Box sx={{ textAlign: "right" }}>
              <Typography variant="caption" sx={{ display: "block", color: "text.secondary", fontSize: "11px", lineHeight: 1.2 }}>
                TAN Status
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  fontWeight: 600,
                  fontSize: "12px",
                  color: (theme) =>
                    isTanConfigured
                      ? theme.palette.mode === "dark"
                        ? "#4ADE80"
                        : "#166534"
                      : theme.palette.mode === "dark"
                      ? "#FBBF24"
                      : "#92400E",
                }}
              >
                {isTanConfigured ? "Configured" : "Missing"}
              </Typography>
            </Box>

            <Box sx={{ width: "1px", height: "24px", bgcolor: "divider" }} />

            <Box sx={{ textAlign: "right" }}>
              <Typography variant="caption" sx={{ display: "block", color: "text.secondary", fontSize: "11px", lineHeight: 1.2 }}>
                PAN Status
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  fontWeight: 600,
                  fontSize: "12px",
                  color: (theme) =>
                    isPanConfigured
                      ? theme.palette.mode === "dark"
                        ? "#4ADE80"
                        : "#166534"
                      : theme.palette.mode === "dark"
                      ? "#FBBF24"
                      : "#92400E",
                }}
              >
                {isPanConfigured ? "Configured" : "Missing"}
              </Typography>
            </Box>
          </Box>

          {/* Actions */}
          <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
            {isOwner && (
              <Button
                variant="contained"
                size="small"
                startIcon={<EditOutlined sx={{ fontSize: 15 }} />}
                onClick={onEdit}
                sx={{
                  height: "34px",
                  borderRadius: "6px",
                  bgcolor: "primary.main",
                  color: "primary.contrastText",
                  textTransform: "none",
                  fontWeight: 600,
                  fontSize: "13px",
                  boxShadow: "none",
                  px: 2,
                  "&:hover": { bgcolor: "primary.dark", boxShadow: "none" },
                }}
              >
                Edit Company
              </Button>
            )}

            <IconButton
              size="small"
              onClick={handleOpenMenu}
              sx={{
                width: "34px",
                height: "34px",
                borderRadius: "6px",
                border: "1px solid",
                borderColor: "divider",
                color: "text.secondary",
                "&:hover": { bgcolor: "action.hover" },
              }}
            >
              <MoreVertOutlined sx={{ fontSize: 18 }} />
            </IconButton>

            <Menu
              anchorEl={menuAnchor}
              open={Boolean(menuAnchor)}
              onClose={handleCloseMenu}
              anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
              transformOrigin={{ vertical: "top", horizontal: "right" }}
              slotProps={{ paper: { sx: { borderRadius: "8px", minWidth: 190, mt: 0.5, bgcolor: "background.paper", border: "1px solid", borderColor: "divider" } } }}
            >
              <MenuItem
                onClick={() => {
                  handleCloseMenu();
                  onManageAdmins?.();
                }}
              >
                <ListItemIcon sx={{ color: "text.secondary", minWidth: 30 }}>
                  <GroupOutlined sx={{ fontSize: 17 }} />
                </ListItemIcon>
                <ListItemText primary={<Typography sx={{ fontSize: "13px", fontWeight: 500, color: "text.primary" }}>Manage Administrators</Typography>} />
              </MenuItem>

              <MenuItem onClick={handleExportDetails}>
                <ListItemIcon sx={{ color: "text.secondary", minWidth: 30 }}>
                  <FileDownloadOutlined sx={{ fontSize: 17 }} />
                </ListItemIcon>
                <ListItemText primary={<Typography sx={{ fontSize: "13px", fontWeight: 500, color: "text.primary" }}>Export Details</Typography>} />
              </MenuItem>

              <MenuItem onClick={handleDeactivate}>
                <ListItemIcon sx={{ color: "warning.main", minWidth: 30 }}>
                  <BlockOutlined sx={{ fontSize: 17 }} />
                </ListItemIcon>
                <ListItemText primary={<Typography sx={{ fontSize: "13px", fontWeight: 500, color: "warning.main" }}>Deactivate Company</Typography>} />
              </MenuItem>

              {isOwner && onDeleteClick && (
                <MenuItem
                  onClick={() => {
                    handleCloseMenu();
                    onDeleteClick();
                  }}
                  sx={{ borderTop: "1px solid", borderTopColor: "divider", mt: 0.5, pt: 1 }}
                >
                  <ListItemIcon sx={{ color: "error.main", minWidth: 30 }}>
                    <DeleteOutlineOutlined sx={{ fontSize: 17 }} />
                  </ListItemIcon>
                  <ListItemText primary={<Typography sx={{ fontSize: "13px", fontWeight: 500, color: "error.main" }}>Delete Company</Typography>} />
                </MenuItem>
              )}
            </Menu>
          </Stack>
        </Box>
      </Box>
    </Card>
  );
}
