import { Grid } from "@mui/material";
import PeopleOutlined from "@mui/icons-material/PeopleOutlined";
import SchemaOutlined from "@mui/icons-material/SchemaOutlined";
import DomainOutlined from "@mui/icons-material/DomainOutlined";
import ReceiptLongOutlined from "@mui/icons-material/ReceiptLongOutlined";
import DescriptionOutlined from "@mui/icons-material/DescriptionOutlined";
import FactCheckOutlined from "@mui/icons-material/FactCheckOutlined";
import EventBusyOutlined from "@mui/icons-material/EventBusyOutlined";

import { MetricCard } from "../ui";
import type { Company } from "../../types";

interface CompanyStatsProps {
  company: Company;
}

export default function CompanyStats({ company }: CompanyStatsProps) {
  const employeeCount = company.users?.length ?? 12;

  const stats = [
    { label: "Total Employees", value: employeeCount, icon: <PeopleOutlined />, trend: "+2 this month", trendColor: "#16A34A" },
    { label: "Departments", value: 5, icon: <SchemaOutlined />, trend: "Core operational", trendColor: "#6B7280" },
    { label: "Active Branches", value: 3, icon: <DomainOutlined />, trend: "HQ, SF, London", trendColor: "#6B7280" },
    { label: "Payroll Runs", value: 12, icon: <ReceiptLongOutlined />, trend: "100% processed", trendColor: "#16A34A" },
    { label: "Tax Declarations", value: 45, icon: <DescriptionOutlined />, trend: "Q2 approved", trendColor: "#16A34A" },
    { label: "Average Attendance", value: "98.4%", icon: <FactCheckOutlined />, trend: "96.5% target met", trendColor: "#16A34A" },
    { label: "Leave Requests", value: 4, icon: <EventBusyOutlined />, trend: "Pending approval", trendColor: "#F59E0B" },
  ];

  return (
    <Grid container spacing={3}>
      {stats.map((stat, idx) => (
        <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={idx}>
          <MetricCard
            label={stat.label}
            value={stat.value}
            icon={stat.icon}
            trend={stat.trend}
            trendColor={stat.trendColor}
          />
        </Grid>
      ))}
    </Grid>
  );
}
