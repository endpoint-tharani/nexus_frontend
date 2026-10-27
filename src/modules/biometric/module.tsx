import { MdFingerprint, MdDevicesOther } from "react-icons/md";

import { CompanyRole } from "../../constants/enums";
import { ProductModule } from "../../constants/modules";
import ModulePlaceholder from "../../pages/common/ModulePlaceholder";
import type { ModuleDefinition } from "../types";

const Biometric = () => (
  <ModulePlaceholder
    title="Biometric Devices"
    description="Register biometric/RFID devices and auto-sync punches into attendance."
    icon={<MdDevicesOther size={32} />}
    color="info"
  />
);

const { OWNER, ADMIN } = CompanyRole;
const ADMIN_ROLES = [OWNER, ADMIN] as const;

export const biometricModule: ModuleDefinition = {
  module: ProductModule.BIOMETRIC,
  label: "Biometric Integration",
  icon: MdFingerprint,
  nav: [
    {
      label: "Biometric",
      icon: MdFingerprint,
      items: [
        {
          label: "Devices",
          path: "/dashboard/biometric",
          icon: MdDevicesOther,
          roles: ADMIN_ROLES,
        },
      ],
    },
  ],
  routes: [{ path: "biometric", component: Biometric, roles: ADMIN_ROLES }],
};
