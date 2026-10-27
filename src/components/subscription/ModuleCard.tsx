import { Box, Button, Card, CircularProgress, Typography } from "@mui/material";
import { alpha } from "@mui/material/styles";
import { MdCheck, MdAdd, MdAutorenew, MdBlock } from "react-icons/md";

import {
  MODULE_META,
  ModuleStatus,
  ProductModule,
} from "../../constants/modules";
import type { ProductModule as ProductModuleType } from "../../constants/modules";
import { getModuleDefinition } from "../../modules/moduleRegistry";
import ModuleStatusChip from "./ModuleStatusChip";

export interface ModuleCardProps {
  module: ProductModuleType;
  status: ModuleStatus;
  onEnable?: () => void;
  onDisable?: () => void;
  busy?: boolean;
  /** Hide the action button (read-only display). */
  readOnly?: boolean;
}

// A product card for the marketplace / subscription surfaces. Shows the module's
// branding + status and a single contextual action (enable / disable / renew).
export default function ModuleCard({
  module,
  status,
  onEnable,
  onDisable,
  busy = false,
  readOnly = false,
}: ModuleCardProps) {
  const meta = MODULE_META[module];
  const Icon = getModuleDefinition(module)?.icon;
  const isActive =
    status === ModuleStatus.ENABLED || status === ModuleStatus.TRIAL;

  const action = isActive
    ? { label: "Disable", icon: <MdBlock size={18} />, variant: "outlined" as const, color: "error" as const, onClick: onDisable }
    : status === ModuleStatus.EXPIRED
      ? { label: "Renew", icon: <MdAutorenew size={18} />, variant: "contained" as const, color: "primary" as const, onClick: onEnable }
      : { label: "Enable", icon: <MdAdd size={18} />, variant: "contained" as const, color: "primary" as const, onClick: onEnable };

  return (
    <Card
      sx={{
        p: 2.5,
        height: "100%",
        display: "flex",
        flexDirection: "column",
        gap: 1.5,
        ...(isActive && {
          borderColor: "success.main",
          boxShadow: (theme) =>
            `0 0 0 1px ${alpha(theme.palette.success.main, 0.4)}`,
        }),
      }}
    >
      <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 1 }}>
        <Box
          aria-hidden
          sx={{
            width: 48,
            height: 48,
            borderRadius: 2.5,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "primary.main",
            bgcolor: (theme) => alpha(theme.palette.primary.main, 0.12),
          }}
        >
          {Icon ? <Icon size={24} /> : <MdCheck size={24} />}
        </Box>
        <ModuleStatusChip status={status} />
      </Box>

      <Box sx={{ flexGrow: 1 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
          {meta.label}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {meta.tagline}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          {meta.description}
        </Typography>
      </Box>

      {!readOnly && module !== ProductModule.CORE && (
        <Button
          variant={action.variant}
          color={action.color}
          startIcon={busy ? <CircularProgress size={16} color="inherit" /> : action.icon}
          onClick={action.onClick}
          disabled={busy || !action.onClick}
          fullWidth
        >
          {action.label}
        </Button>
      )}
    </Card>
  );
}
