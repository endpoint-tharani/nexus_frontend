import { useState } from "react";
import { IconButton, Menu, MenuItem, ListItemIcon, ListItemText, Tooltip } from "@mui/material";
import { MdOutlineWbSunny, MdOutlineDarkMode, MdOutlineAutoAwesome } from "react-icons/md";
import { useThemeStore } from "../../store/theme.store";
import type { ThemeMode } from "../../store/theme.store";

export function ThemeSwitcher() {
  const { themeMode, setThemeMode } = useThemeStore();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleSelect = (mode: ThemeMode) => {
    setThemeMode(mode);
    handleClose();
  };

  const getThemeIcon = (mode: ThemeMode) => {
    switch (mode) {
      case "dark":
        return <MdOutlineDarkMode size={20} />;
      case "auronox":
        return <MdOutlineAutoAwesome size={20} style={{ color: "#A78BFA" }} />;
      case "light":
      default:
        return <MdOutlineWbSunny size={20} style={{ color: "#EAB308" }} />;
    }
  };

  return (
    <>
      <Tooltip title="Switch theme">
        <IconButton
          onClick={handleClick}
          size="medium"
          aria-controls={open ? "theme-menu" : undefined}
          aria-haspopup="true"
          aria-expanded={open ? "true" : undefined}
          sx={{
            borderRadius: "10px",
            border: "1px solid",
            borderColor: "divider",
            color: "text.primary",
            bgcolor: "background.paper",
            transition: "all 0.2s ease-in-out",
            "&:hover": {
              transform: "scale(1.05)",
              bgcolor: "action.hover",
              borderColor: themeMode === "auronox" ? "primary.main" : "divider",
            },
          }}
        >
          {getThemeIcon(themeMode)}
        </IconButton>
      </Tooltip>
      <Menu
        id="theme-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
        slotProps={{
          paper: {
            elevation: 3,
            sx: {
              mt: 1.5,
              minWidth: 170,
              borderRadius: "12px",
              border: "1px solid",
              borderColor: "divider",
              overflow: "visible",
              "&::before": {
                content: '""',
                display: "block",
                position: "absolute",
                top: 0,
                right: 14,
                width: 10,
                height: 10,
                bgcolor: "background.paper",
                transform: "translateY(-50%) rotate(45deg)",
                zIndex: 0,
                borderLeft: "1px solid",
                borderTop: "1px solid",
                borderColor: "divider",
              },
            },
          },
        }}
      >
        <MenuItem
          selected={themeMode === "light"}
          onClick={() => handleSelect("light")}
          sx={{
            mx: 0.75,
            my: 0.25,
            borderRadius: "8px",
            transition: "all 0.15s ease",
            "&.Mui-selected": {
              bgcolor: "primary.main",
              color: "primary.contrastText",
              "&:hover": { bgcolor: "primary.dark" },
              "& .MuiListItemIcon-root": { color: "inherit" },
            },
          }}
        >
          <ListItemIcon sx={{ color: themeMode === "light" ? "inherit" : "#EAB308", minWidth: 32 }}>
            <MdOutlineWbSunny size={18} />
          </ListItemIcon>
          <ListItemText primary="Light Mode" slotProps={{ primary: { sx: { fontSize: "0.875rem", fontWeight: 500 } } }} />
        </MenuItem>
        <MenuItem
          selected={themeMode === "dark"}
          onClick={() => handleSelect("dark")}
          sx={{
            mx: 0.75,
            my: 0.25,
            borderRadius: "8px",
            transition: "all 0.15s ease",
            "&.Mui-selected": {
              bgcolor: "primary.main",
              color: "primary.contrastText",
              "&:hover": { bgcolor: "primary.dark" },
              "& .MuiListItemIcon-root": { color: "inherit" },
            },
          }}
        >
          <ListItemIcon sx={{ color: themeMode === "dark" ? "inherit" : "text.secondary", minWidth: 32 }}>
            <MdOutlineDarkMode size={18} />
          </ListItemIcon>
          <ListItemText primary="Dark Mode" slotProps={{ primary: { sx: { fontSize: "0.875rem", fontWeight: 500 } } }} />
        </MenuItem>
        <MenuItem
          selected={themeMode === "auronox"}
          onClick={() => handleSelect("auronox")}
          sx={{
            mx: 0.75,
            my: 0.25,
            borderRadius: "8px",
            transition: "all 0.15s ease",
            "&.Mui-selected": {
              bgcolor: "primary.main",
              color: "primary.contrastText",
              "&:hover": { bgcolor: "primary.dark" },
              "& .MuiListItemIcon-root": { color: "inherit" },
            },
          }}
        >
          <ListItemIcon sx={{ color: themeMode === "auronox" ? "inherit" : "#A78BFA", minWidth: 32 }}>
            <MdOutlineAutoAwesome size={18} />
          </ListItemIcon>
          <ListItemText primary="Midnight Purple" slotProps={{ primary: { sx: { fontSize: "0.875rem", fontWeight: 500 } } }} />
        </MenuItem>
      </Menu>
    </>
  );
}

export default ThemeSwitcher;
