import { Box, Button, Grid } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import { MdAccountTree, MdBusiness } from "react-icons/md";
import { hasAccess } from "../../constants/navigation";
import { coreModule } from "../../modules/core/module";
import { useCurrentRole } from "../../hooks/user";
import { useRouteAllowed } from "../../core/navigation";
import { SectionCard } from "../ui";

const QUICK_LINKS = [
  { label: "Manage branches", path: "/dashboard/branches", icon: MdBusiness },
  { label: "Manage departments", path: "/dashboard/departments", icon: MdAccountTree },
];

export default function DashboardEngine() {
  const role = useCurrentRole();
  const widgets = (coreModule.widgets ?? [])
    .filter((widget) => hasAccess(widget.roles, role))
    .sort((first, second) => (first.order ?? 0) - (second.order ?? 0));
  const routeAllowed = useRouteAllowed();

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      <Grid container spacing={2}>
        {widgets.map(({ id, component: Widget, span }) => (
          <Grid key={id} size={span ?? { xs: 12, sm: 6, md: 3 }}>
            <Widget />
          </Grid>
        ))}
      </Grid>
      <SectionCard title="Organization structure" subtitle="Manage your organization, branches, and departments.">
        <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap" }}>
          {QUICK_LINKS.filter(({ path }) => routeAllowed(path)).map(({ label, path, icon: Icon }) => (
            <Button key={path} component={RouterLink} to={path} variant="outlined" startIcon={<Icon />}>
              {label}
            </Button>
          ))}
        </Box>
      </SectionCard>
    </Box>
  );
}
