import { lazy } from "react";
import {
  MdEventAvailable,
  MdCalendarMonth,
  MdSchedule,
  MdBeachAccess,
  MdBarChart,
  MdHowToReg,
  MdAccessTime,
  MdPersonOff,
} from "react-icons/md";

import { CompanyRole, AttendanceStatus } from "../../constants/enums";
import { ProductModule } from "../../constants/modules";
import { StatCard } from "../../components/ui";
import { useAttendanceDashboard } from "../../hooks/attendance";
import { formatNumber } from "../../utils/format";
import ModulePlaceholder from "../../pages/common/ModulePlaceholder";
import type { ModuleDefinition } from "../types";

const Attendance = lazy(() => import("../../pages/dashboard/Attendance"));
const MyAttendance = lazy(() => import("../../pages/dashboard/MyAttendance"));
const Shifts = lazy(() => import("../../pages/dashboard/Shifts"));
const Holidays = lazy(() => import("../../pages/dashboard/Holidays"));
const AttendanceReports = () => (
  <ModulePlaceholder
    title="Attendance Reports"
    description="Monthly muster, late-mark and absenteeism reports are on the way."
    icon={<MdBarChart size={32} />}
    color="info"
  />
);

const { OWNER, ADMIN, HR, EMPLOYEE } = CompanyRole;
const ORG = [OWNER, ADMIN, HR] as const;
const KPI_SPAN = { xs: 6, md: 3 } as const;

// --- org widgets (live daily attendance dashboard) ---
function AttendancePresentWidget() {
  const { data, isLoading } = useAttendanceDashboard();
  return (
    <StatCard
      label="Today's Attendance"
      value={formatNumber(data?.present ?? 0, "0")}
      icon={<MdHowToReg size={22} />}
      color="success"
      loading={isLoading}
    />
  );
}

function AttendanceLateWidget() {
  const { data, isLoading } = useAttendanceDashboard();
  const late = data?.byStatus?.[AttendanceStatus.LATE_ENTRY] ?? 0;
  return (
    <StatCard
      label="Late Employees"
      value={formatNumber(late, "0")}
      icon={<MdAccessTime size={22} />}
      color="warning"
      loading={isLoading}
    />
  );
}

function AttendanceAbsentWidget() {
  const { data, isLoading } = useAttendanceDashboard();
  return (
    <StatCard
      label="Absent Employees"
      value={formatNumber(data?.absent ?? 0, "0")}
      icon={<MdPersonOff size={22} />}
      color="error"
      loading={isLoading}
    />
  );
}

export const attendanceModule: ModuleDefinition = {
  module: ProductModule.ATTENDANCE,
  label: "Attendance",
  icon: MdEventAvailable,
  nav: [
    {
      label: "Attendance",
      icon: MdEventAvailable,
      items: [
        {
          label: "Attendance",
          path: "/dashboard/attendance",
          icon: MdEventAvailable,
          roles: ORG,
        },
        {
          label: "Shifts",
          path: "/dashboard/attendance/shifts",
          icon: MdSchedule,
          roles: ORG,
        },
        {
          label: "Holidays",
          path: "/dashboard/attendance/holidays",
          icon: MdBeachAccess,
          roles: ORG,
        },
        {
          label: "Reports",
          path: "/dashboard/attendance/reports",
          icon: MdBarChart,
          roles: ORG,
        },
        {
          label: "My Attendance",
          path: "/dashboard/my-attendance",
          icon: MdCalendarMonth,
          roles: [EMPLOYEE],
        },
      ],
    },
  ],
  routes: [
    { path: "attendance", component: Attendance, roles: ORG },
    { path: "attendance/shifts", component: Shifts, roles: ORG },
    { path: "attendance/holidays", component: Holidays, roles: ORG },
    { path: "attendance/reports", component: AttendanceReports, roles: ORG },
    { path: "my-attendance", component: MyAttendance, roles: [EMPLOYEE] },
  ],
  widgets: [
    {
      id: "attendance.present",
      component: AttendancePresentWidget,
      roles: ORG,
      span: KPI_SPAN,
      order: 10,
    },
    {
      id: "attendance.late",
      component: AttendanceLateWidget,
      roles: ORG,
      span: KPI_SPAN,
      order: 11,
    },
    {
      id: "attendance.absent",
      component: AttendanceAbsentWidget,
      roles: ORG,
      span: KPI_SPAN,
      order: 12,
    },
  ],
};
