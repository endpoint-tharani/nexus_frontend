import {
  MdBeachAccess,
  MdEventNote,
  MdPlaylistAddCheck,
} from "react-icons/md";

import { CompanyRole } from "../../constants/enums";
import { ProductModule } from "../../constants/modules";
import ModulePlaceholder from "../../pages/common/ModulePlaceholder";
import type { ModuleDefinition } from "../types";

const Leave = () => (
  <ModulePlaceholder
    title="Leave Management"
    description="Leave types, balances and an approval workflow for managers are coming to your plan."
    icon={<MdPlaylistAddCheck size={32} />}
    color="secondary"
  />
);
const MyLeave = () => (
  <ModulePlaceholder
    title="My Leave"
    description="Apply for leave, track balances and see your request history here."
    icon={<MdEventNote size={32} />}
    color="secondary"
  />
);

const { OWNER, ADMIN, HR, EMPLOYEE } = CompanyRole;
const ORG = [OWNER, ADMIN, HR] as const;

export const leaveModule: ModuleDefinition = {
  module: ProductModule.LEAVE,
  label: "Leave",
  icon: MdBeachAccess,
  nav: [
    {
      label: "Leave",
      icon: MdBeachAccess,
      items: [
        {
          label: "Leave",
          path: "/dashboard/leave",
          icon: MdPlaylistAddCheck,
          roles: ORG,
        },
        {
          label: "My Leave",
          path: "/dashboard/my-leave",
          icon: MdEventNote,
          roles: [EMPLOYEE],
        },
      ],
    },
  ],
  routes: [
    { path: "leave", component: Leave, roles: ORG },
    { path: "my-leave", component: MyLeave, roles: [EMPLOYEE] },
  ],
};
