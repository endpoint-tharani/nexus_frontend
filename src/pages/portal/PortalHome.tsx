import { Box, Button } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import type { IconType } from "react-icons";
import {
  MdRequestQuote,
  MdReceipt,
  MdCalendarMonth,
  MdEventNote,
  MdPerson,
} from "react-icons/md";

import { SectionCard } from "../../components/ui";
import { useModuleAccess } from "../../core/permissions";
import { ProductModule } from "../../constants/modules";
import type { ProductModule as ProductModuleType } from "../../constants/modules";

interface PortalLink {
  label: string;
  path: string;
  icon: IconType;
  module?: ProductModuleType;
}

const LINKS: PortalLink[] = [
  { label: "My Tax Declaration", path: "/dashboard/my-tax", icon: MdRequestQuote, module: ProductModule.TAX_DECLARATION },
  { label: "My Pay Statement", path: "/dashboard/my-pay-statement", icon: MdReceipt, module: ProductModule.PAYROLL },
  { label: "My Attendance", path: "/dashboard/my-attendance", icon: MdCalendarMonth, module: ProductModule.ATTENDANCE },
  { label: "My Leave", path: "/dashboard/my-leave", icon: MdEventNote, module: ProductModule.LEAVE },
  { label: "My Profile", path: "/dashboard/profile", icon: MdPerson },
];

// Employee Portal home — a single self-service hub that surfaces only the
// services the company's plan has enabled.
export default function PortalHome() {
  const { hasModuleAccess } = useModuleAccess();
  const links = LINKS.filter((l) => !l.module || hasModuleAccess(l.module));

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      <SectionCard
        title="My self-service"
        subtitle="Everything available to you in one place"
      >
        <Box
          sx={{
            display: "grid",
            gap: 1.5,
            gridTemplateColumns: {
              xs: "1fr",
              sm: "1fr 1fr",
              md: "repeat(3, 1fr)",
            },
          }}
        >
          {links.map(({ label, path, icon: Icon }) => (
            <Button
              key={path}
              component={RouterLink}
              to={path}
              variant="outlined"
              fullWidth
              startIcon={<Icon size={18} />}
              sx={{ justifyContent: "flex-start" }}
            >
              {label}
            </Button>
          ))}
        </Box>
      </SectionCard>
    </Box>
  );
}
