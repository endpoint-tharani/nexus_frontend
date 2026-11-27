import { lazy } from "react";
import { MdAccountTree, MdBusiness, MdDashboard, MdDevices, MdPerson, MdSchool, MdMenuBook } from "react-icons/md";

import { CompanyRole } from "../../constants/enums";
import { useActiveBranch, useBranches } from "../../hooks/branch";
import { useDepartments } from "../../hooks/department";
import { StatCard } from "../../components/ui";
import type { ModuleDefinition } from "../types";

const Dashboard = lazy(() => import("../../pages/dashboard/Dashboard"));
const Organization = lazy(() => import("../../pages/dashboard/Organization"));
const Branches = lazy(() => import("../../pages/dashboard/Branches"));
const Departments = lazy(() => import("../../pages/dashboard/Departments"));
const Profile = lazy(() => import("../../pages/dashboard/Profile"));
const Sessions = lazy(() => import("../../pages/dashboard/Sessions"));
const Instructor = lazy(() => import("../../pages/dashboard/Instructor"));
const Student = lazy(() => import("../../pages/dashboard/Student"));
const InstructorManagement = lazy(() => import("../../pages/dashboard/InstructorManagement"));
const StudentManagement = lazy(() => import("../../pages/dashboard/StudentManagement"));

const { OWNER, ADMIN, COMPANY_ADMIN, BRANCH_ADMIN, DEPARTMENT_ADMIN, HR, EMPLOYEE, SUPER_ADMIN } = CompanyRole;
const INSTRUCTOR = CompanyRole.INSTRUCTOR;
const STUDENT = CompanyRole.STUDENT;
const INSTRUCTOR_MANAGERS = [OWNER, ADMIN, SUPER_ADMIN] as const;
const ALL = [OWNER, ADMIN, COMPANY_ADMIN, BRANCH_ADMIN, DEPARTMENT_ADMIN, HR, EMPLOYEE, SUPER_ADMIN, INSTRUCTOR, STUDENT] as const;
const ORG_ADMINS = [OWNER, ADMIN, SUPER_ADMIN] as const;
const BRANCH_ADMINS = [OWNER, ADMIN, BRANCH_ADMIN, SUPER_ADMIN] as const;
const DEPARTMENT_ADMINS = [OWNER, ADMIN, BRANCH_ADMIN, DEPARTMENT_ADMIN, SUPER_ADMIN] as const;
const ORG_MANAGERS = [OWNER, ADMIN, BRANCH_ADMIN, DEPARTMENT_ADMIN, SUPER_ADMIN] as const;
const STUDENT_MANAGERS = [
  OWNER,
  ADMIN,
  COMPANY_ADMIN,
  BRANCH_ADMIN,
  DEPARTMENT_ADMIN,
  HR,
  SUPER_ADMIN,
] as const;

function BranchCountWidget() {
  const { data = [], isLoading } = useBranches();
  return (
    <StatCard
      label="Branches"
      value={String(data.length)}
      icon={<MdBusiness size={22} />}
      color="primary"
      loading={isLoading}
    />
  );
}

function DepartmentCountWidget() {
  const { selectedBranchId } = useActiveBranch();
  const { data = [], isLoading } = useDepartments({
    branchId: selectedBranchId || undefined,
    enabled: Boolean(selectedBranchId),
  });
  return (
    <StatCard
      label="Departments"
      value={String(data.length)}
      icon={<MdAccountTree size={22} />}
      color="secondary"
      loading={isLoading}
    />
  );
}

export const coreModule: ModuleDefinition = {
  module: "CORE",
  label: "Organization",
  icon: MdDashboard,
  core: true,
  nav: [
    {
      label: "",
      items: [
        { label: "Dashboard", path: "/dashboard", icon: MdDashboard, roles: ALL },
        { label: "Students", path: "/dashboard/students", icon: MdSchool, roles: STUDENT_MANAGERS },
      ],
    },
    {
      label: "",
      items: [{ label: "Instructor", path: "/dashboard/instructor", icon: MdSchool, roles: [INSTRUCTOR] }],
    },
    {
      label: "",
      items: [{ label: "Instructors", path: "/dashboard/instructors", icon: MdSchool, roles: INSTRUCTOR_MANAGERS }],
    },
    {
      label: "",
      items: [{ label: "Student", path: "/dashboard/student", icon: MdMenuBook, roles: [STUDENT] }],
    },
  ],
  accountNav: [
    { label: "Manage Organization", path: "/dashboard/organization-manager", icon: MdBusiness, roles: ORG_MANAGERS },
    { label: "Profile", path: "/dashboard/profile", icon: MdPerson, roles: ALL },
    { label: "Sessions", path: "/dashboard/sessions", icon: MdDevices, roles: ALL },
  ],
  routes: [
    { path: "", index: true, component: Dashboard, roles: ALL },
    { path: "organization", component: Organization, roles: ORG_ADMINS },
    { path: "branches", component: Branches, roles: BRANCH_ADMINS },
    { path: "departments", component: Departments, roles: DEPARTMENT_ADMINS },
    { path: "profile", component: Profile, roles: ALL },
    { path: "sessions", component: Sessions, roles: ALL },
    { path: "instructor", component: Instructor, roles: [INSTRUCTOR] },
    { path: "instructors", component: InstructorManagement, roles: INSTRUCTOR_MANAGERS },
    { path: "student", component: Student, roles: [STUDENT] },
    { path: "students", component: StudentManagement, roles: STUDENT_MANAGERS },
  ],
  widgets: [
    {
      id: "core.branches",
      component: BranchCountWidget,
      roles: BRANCH_ADMINS,
      span: { xs: 12, sm: 6, md: 3 },
      order: 0,
    },
    {
      id: "core.departments",
      component: DepartmentCountWidget,
      roles: DEPARTMENT_ADMINS,
      span: { xs: 12, sm: 6, md: 3 },
      order: 1,
    },
  ],
};
