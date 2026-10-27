import DashboardEngine from "../../components/dashboard/DashboardEngine";

// Module-driven dashboard. The widget set is generated from the company's enabled
// modules ∩ the caller's role (see DashboardEngine / the module registry), so the
// dashboard adapts automatically as modules are purchased — no per-role hardcoding.
export default function Dashboard() {
  return <DashboardEngine />;
}
