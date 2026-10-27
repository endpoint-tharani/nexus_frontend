import { lazy } from "react";
import { MdBadge, MdHome } from "react-icons/md";

import { CompanyRole } from "../../constants/enums";
import { ProductModule } from "../../constants/modules";
import type { ModuleDefinition } from "../types";

const PortalHome = lazy(() => import("../../pages/portal/PortalHome"));

const { EMPLOYEE } = CompanyRole;

// EMPLOYEE_PORTAL — a consolidated self-service home. The per-feature employee
// pages (My Tax / My Pay / My Attendance) are owned by their own modules; this
// module adds the unified landing that links to whatever self-service the company
// has enabled.
export const employeePortalModule: ModuleDefinition = {
  module: ProductModule.EMPLOYEE_PORTAL,
  label: "Employee Portal",
  icon: MdBadge,
  nav: [
    {
      label: "My Space",
      icon: MdBadge,
      items: [
        {
          label: "My Portal",
          path: "/dashboard/portal",
          icon: MdHome,
          roles: [EMPLOYEE],
        },
      ],
    },
  ],
  routes: [{ path: "portal", component: PortalHome, roles: [EMPLOYEE] }],
};
