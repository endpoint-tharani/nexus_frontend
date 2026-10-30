import { Box, Chip, Grid, Typography } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import {
  Area, AreaChart, Bar, BarChart, CartesianGrid, ResponsiveContainer,
  Tooltip, XAxis, YAxis,
} from "recharts";
import { MdGroups, MdSportsMartialArts, MdEventAvailable, MdEmojiEvents } from "react-icons/md";
import { hasAccess } from "../../constants/navigation";
import { coreModule } from "../../modules/core/module";
import { useCurrentRole } from "../../hooks/user";
import { SectionCard, StatCard } from "../ui";
import ChartCard from "./ChartCard";

const attendanceData = [
  { month: "May", rate: 94 }, { month: "Jun", rate: 96 }, { month: "Jul", rate: 93 },
  { month: "Aug", rate: 97 }, { month: "Sep", rate: 95 }, { month: "Oct", rate: 98 },
];
const studentGrowthData = [
  { month: "May", students: 182 }, { month: "Jun", students: 194 }, { month: "Jul", students: 201 },
  { month: "Aug", students: 216 }, { month: "Sep", students: 229 }, { month: "Oct", students: 248 },
];
const tournamentEvents = [
  { date: "NOV 08", name: "Inter-Dojo Kata Championship", detail: "Main Dojo · 9:00 AM", kind: "Tournament" },
  { date: "NOV 15", name: "Belt Promotion Grading", detail: "North Branch · 10:30 AM", kind: "Grading" },
  { date: "NOV 22", name: "Youth Kumite Workshop", detail: "Main Dojo · 2:00 PM", kind: "Workshop" },
];

export default function DashboardEngine() {
  const role = useCurrentRole();
  const widgets = (coreModule.widgets ?? [])
    .filter((widget) => hasAccess(widget.roles, role))
    .sort((first, second) => (first.order ?? 0) - (second.order ?? 0));
  const theme = useTheme();
  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 1 }}>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>Dashboard</Typography>
        <Chip label="Demo data" size="small" color="info" variant="outlined" />
      </Box>
      <Grid container spacing={2}>
        <Grid size={{ xs: 6, sm: 6, md: 3 }}><StatCard label="Active students" value="248" icon={<MdGroups />} trend="8.2% this term" trendDirection="up" /></Grid>
        <Grid size={{ xs: 6, sm: 6, md: 3 }}><StatCard label="Classes this week" value="32" icon={<MdSportsMartialArts />} trend="Across 4 dojos" /></Grid>
        <Grid size={{ xs: 6, sm: 6, md: 3 }}><StatCard label="Upcoming events" value="3" icon={<MdEmojiEvents />} trend="Next: Nov 08" /></Grid>
        <Grid size={{ xs: 6, sm: 6, md: 3 }}><StatCard label="Class attendance" value="96.8%" icon={<MdEventAvailable />} trend="2.4% this month" trendDirection="up" /></Grid>
      </Grid>
      <Grid container spacing={2}>
        {widgets.map(({ id, component: Widget, span }) => (
          <Grid key={id} size={span ?? { xs: 12, sm: 6, md: 3 }}>
            <Widget />
          </Grid>
        ))}
      </Grid>
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 7 }}>
          <ChartCard title="Student enrollment" subtitle="Active students · last 6 months" height={280}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={studentGrowthData} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
                <defs><linearGradient id="demoStudents" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={theme.palette.primary.main} stopOpacity={0.32} /><stop offset="100%" stopColor={theme.palette.primary.main} stopOpacity={0.02} /></linearGradient></defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme.palette.divider} />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: theme.palette.text.secondary }} axisLine={{ stroke: theme.palette.divider }} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: theme.palette.text.secondary }} axisLine={false} tickLine={false} />
                <Tooltip />
                <Area type="monotone" dataKey="students" name="Students" stroke={theme.palette.primary.main} strokeWidth={2.5} fill="url(#demoStudents)" />
              </AreaChart>
            </ResponsiveContainer>
          </ChartCard>
        </Grid>
        <Grid size={{ xs: 12, md: 5 }}>
          <ChartCard title="Dojo class attendance" subtitle="Average attendance rate by month" height={280}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={attendanceData} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme.palette.divider} />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: theme.palette.text.secondary }} axisLine={false} tickLine={false} />
                <YAxis domain={[80, 100]} tickFormatter={(value: number) => `${value}%`} tick={{ fontSize: 12, fill: theme.palette.text.secondary }} axisLine={false} tickLine={false} />
                <Tooltip formatter={(value) => [`${value}%`, "Attendance"]} />
                <Bar dataKey="rate" name="Attendance" fill={theme.palette.success.main} radius={[5, 5, 0, 0]} maxBarSize={36} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </Grid>
      </Grid>
      <SectionCard title="Upcoming tournaments & events" subtitle="Important dates across your dojos">
        <Box sx={{ display: "flex", flexDirection: "column" }}>
          {tournamentEvents.map((event) => (
            <Box key={event.name} sx={{ display: "flex", alignItems: "center", gap: 2, py: 1.5, borderBottom: "1px solid", borderColor: "divider", "&:last-child": { borderBottom: 0, pb: 0 } }}>
              <Box sx={{ minWidth: 54, textAlign: "center", px: 1, py: 0.75, borderRadius: 1.5, bgcolor: "action.hover" }}>
                <Typography variant="caption" sx={{ fontWeight: 700 }}>{event.date.split(" ")[0]}</Typography>
                <Typography variant="body2" sx={{ fontWeight: 700, lineHeight: 1 }}>{event.date.split(" ")[1]}</Typography>
              </Box>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>{event.name}</Typography>
                <Typography variant="caption" color="text.secondary">{event.detail}</Typography>
              </Box>
              <Chip size="small" label={event.kind} variant="outlined" />
            </Box>
          ))}
        </Box>
      </SectionCard>
      <Typography variant="caption" color="text.secondary">Sample figures are shown for dashboard preview and are not live organization data.</Typography>
    </Box>
  );
}
