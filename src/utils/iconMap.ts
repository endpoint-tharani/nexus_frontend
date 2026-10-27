import * as MdIcons from "react-icons/md";
import type { IconType } from "react-icons";

// Map simple string names returned by the backend to concrete react-icons components.
const CUSTOM_ICON_MAP: Record<string, IconType> = {
  "dashboard": MdIcons.MdDashboard,
  "users": MdIcons.MdGroups,
  "calendar-check": MdIcons.MdEventAvailable,
  "plane": MdIcons.MdBeachAccess,
  "wallet": MdIcons.MdPayments,
  "fingerprint": MdIcons.MdFingerprint,
  "gavel": MdIcons.MdGavel,
  "receipt": MdIcons.MdReceiptLong,
  "edit-document": MdIcons.MdDescription,
  "bar-chart": MdIcons.MdBarChart,
  "clock": MdIcons.MdAccessTime,
  "calendar": MdIcons.MdCalendarToday,
  "list": MdIcons.MdFormatListBulleted,
  "shield": MdIcons.MdShield,
  "layers": MdIcons.MdLayers,
  "file-text": MdIcons.MdDescription,
  "building": MdIcons.MdBusiness,
  "user": MdIcons.MdPerson,
  "map-pin": MdIcons.MdPlace,
  "award": MdIcons.MdStars,
};

/**
 * Dynamically resolves an icon name to a React Icon component from `react-icons/md`.
 * Supports both custom shorthand aliases (e.g. "users") and full component names (e.g. "MdPayments").
 */
export const getIconComponent = (name: string): IconType => {
  if (!name) return MdIcons.MdDashboard;
  
  // 1. Try predefined shorthand aliases
  if (name in CUSTOM_ICON_MAP) {
    return CUSTOM_ICON_MAP[name];
  }
  
  // 2. Try direct react-icons lookup (e.g. "MdPayments")
  if (name in MdIcons) {
    return (MdIcons as any)[name];
  }
  
  // Fallback
  return MdIcons.MdDashboard;
};
