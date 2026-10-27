import { Chip } from "@mui/material";
import {
  MODULE_STATUS_COLORS,
  MODULE_STATUS_LABELS,
} from "../../constants/modules";
import type { ModuleStatus } from "../../constants/modules";

export interface ModuleStatusChipProps {
  status: ModuleStatus;
  size?: "small" | "medium";
}

// Single source of truth for module-status → color/label on the subscription /
// marketplace surfaces.
export default function ModuleStatusChip({
  status,
  size = "small",
}: ModuleStatusChipProps) {
  return (
    <Chip
      label={MODULE_STATUS_LABELS[status]}
      color={MODULE_STATUS_COLORS[status]}
      size={size}
      variant="filled"
    />
  );
}
