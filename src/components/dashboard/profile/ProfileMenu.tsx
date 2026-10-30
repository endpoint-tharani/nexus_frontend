import { useState } from "react";
import {
  Avatar,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Box,
  Typography,
  Divider,
  ButtonBase,
  Button,
} from "@mui/material";
import { MdLogout, MdUnfoldMore } from "react-icons/md";
import type { IconType } from "react-icons";
import { useNavigate } from "react-router-dom";
import { useSubscription } from "../../../core/subscription";
import { useAuthStore } from "../../../store/auth.store";
import { CompanyRole } from "../../../constants/enums";

export interface ProfileMenuItem {
  label: string;
  path: string;
  icon: IconType;
}

interface ProfileMenuProps {
  name?: string;
  email?: string;
  /** Account / settings entries shown inside the menu (role-filtered upstream). */
  items: ProfileMenuItem[];
  onLogout: () => void;
  /** Mini sidebar: render the trigger as an avatar-only button. */
  compact?: boolean;
}

const avatarGradient = (theme: import("@mui/material").Theme) =>
  `linear-gradient(135deg, ${theme.palette.secondary.main}, ${theme.palette.primary.main})`;

export default function ProfileMenu({
  name,
  email,
  items,
  onLogout,
  compact = false,
}: ProfileMenuProps) {
  const navigate = useNavigate();
  const { data: sub } = useSubscription();
  const user = useAuthStore((s) => s.user);

  const planName = sub?.isFallback ? "Free Plan" : (sub?.plan?.name || "Free Plan");
  const canUpgrade = user?.role === CompanyRole.OWNER || user?.role === CompanyRole.ADMIN;

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const initial = name?.charAt(0)?.toUpperCase() || "U";

  return (
    <>
      {/* Trigger — sits at the bottom of the sidebar (ChatGPT-style). */}
      <ButtonBase
        onClick={handleOpen}
        aria-label="Open account menu"
        aria-haspopup="true"
        aria-expanded={open}
        sx={{
          width: "100%",
          borderRadius: 2,
          px: 1,
          py: 0.75,
          gap: 1.25,
          justifyContent: compact ? "center" : "flex-start",
          transition: "background-color 0.2s ease",
          "&:hover": { bgcolor: "action.hover" },
        }}
      >
        <Avatar
          sx={{
            width: 36,
            height: 36,
            fontWeight: 700,
            fontSize: 15,
            background: avatarGradient,
          }}
        >
          {initial}
        </Avatar>

        {!compact && (
          <>
            <Box sx={{ minWidth: 0, flexGrow: 1, textAlign: "left" }}>
              <Typography noWrap sx={{ fontWeight: 600, fontSize: "0.875rem", lineHeight: 1.2 }}>
                {name || "User"}
              </Typography>
              <Typography
                variant="caption"
                color="text.secondary"
                noWrap
                sx={{ display: "block", fontSize: "0.72rem", mt: 0.25 }}
              >
                {planName}
              </Typography>
            </Box>
            {canUpgrade && (
              <Button
                size="small"
                onClick={(e) => {
                  e.stopPropagation(); // prevent opening the menu
                  navigate("/dashboard/subscription");
                }}
                sx={{
                  textTransform: "none",
                  fontSize: "0.72rem",
                  fontWeight: 600,
                  color: "text.primary",
                  border: "1px solid",
                  borderColor: "divider",
                  borderRadius: "6px",
                  px: 1,
                  py: 0.25,
                  mr: 0.5,
                  bgcolor: "background.paper",
                  minWidth: "auto",
                  "&:hover": {
                    bgcolor: "action.hover",
                    borderColor: "primary.main",
                  }
                }}
              >
                Upgrade
              </Button>
            )}
            <MdUnfoldMore size={18} />
          </>
        )}
      </ButtonBase>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        anchorOrigin={{ vertical: "top", horizontal: compact ? "right" : "center" }}
        transformOrigin={{ vertical: "bottom", horizontal: compact ? "left" : "center" }}
        slotProps={{
          paper: {
            elevation: 8,
            sx: {
              width: 280,
              mb: 1,
              borderRadius: 3,
              overflow: "hidden",
              border: "1px solid",
              borderColor: "divider",
            },
          },
        }}
      >
        {/* User details */}
        <Box sx={{ p: 2, display: "flex", alignItems: "center", gap: 1.5 }}>
          <Avatar
            sx={{
              width: 42,
              height: 42,
              fontWeight: 700,
              background: avatarGradient,
            }}
          >
            {initial}
          </Avatar>

          <Box sx={{ minWidth: 0 }}>
            <Typography noWrap sx={{ fontWeight: 600 }}>
              {name || "User"}
            </Typography>
            <Typography variant="body2" color="text.secondary" noWrap sx={{ mb: 0.25 }}>
              {email}
            </Typography>
            <Typography variant="caption" color="primary.main" sx={{ fontWeight: 600 }}>
              {planName}
            </Typography>
          </Box>
        </Box>

        <Divider />

        {items.map((item) => {
          const Icon = item.icon;
          const isOrganizationManagerItem = item.label.startsWith("Organization Manager · ");
          const isFirstOrganizationManagerItem = isOrganizationManagerItem &&
            !items.slice(0, items.indexOf(item)).some((entry) => entry.label.startsWith("Organization Manager · "));
          return (
            <Box key={item.path}>
              {isFirstOrganizationManagerItem && (
                <>
                  <Divider />
                  <Typography variant="overline" color="text.secondary" sx={{ display: "block", px: 2, pt: 1.25, lineHeight: 2 }}>
                    Organization Manager
                  </Typography>
                </>
              )}
              <MenuItem
                onClick={() => {
                  handleClose();
                  navigate(item.path);
                }}
                sx={{ py: 1.25 }}
              >
                <ListItemIcon>
                  <Icon size={18} />
                </ListItemIcon>
                <ListItemText primary={isOrganizationManagerItem ? item.label.split(" · ").slice(1).join(" · ") : item.label} />
              </MenuItem>
            </Box>
          );
        })}

        <Divider />

        <MenuItem
          onClick={() => {
            handleClose();
            onLogout();
          }}
          sx={{ py: 1.25, color: "error.main" }}
        >
          <ListItemIcon sx={{ color: "error.main" }}>
            <MdLogout size={18} />
          </ListItemIcon>
          <ListItemText primary="Sign Out" />
        </MenuItem>
      </Menu>
    </>
  );
}
