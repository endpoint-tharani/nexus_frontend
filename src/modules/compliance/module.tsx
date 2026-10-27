import { MdGavel, MdFactCheck } from "react-icons/md";

import { CompanyRole } from "../../constants/enums";
import { ProductModule } from "../../constants/modules";
import ModulePlaceholder from "../../pages/common/ModulePlaceholder";
import type { ModuleDefinition } from "../types";

const Compliance = () => (
  <ModulePlaceholder
    title="Statutory Compliance"
    description="PF, ESI, professional tax registers and a compliance calendar are coming to your plan."
    icon={<MdFactCheck size={32} />}
    color="warning"
  />
);

const { OWNER, ADMIN } = CompanyRole;
const ADMIN_ROLES = [OWNER, ADMIN] as const;

export const complianceModule: ModuleDefinition = {
  module: ProductModule.COMPLIANCE,
  label: "Compliance",
  icon: MdGavel,
  nav: [
    {
      label: "Compliance",
      icon: MdGavel,
      items: [
        {
          label: "Statutory",
          path: "/dashboard/compliance",
          icon: MdFactCheck,
          roles: ADMIN_ROLES,
        },
      ],
    },
  ],
  routes: [{ path: "compliance", component: Compliance, roles: ADMIN_ROLES }],
};
