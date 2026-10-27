import { Box, Typography } from "@mui/material";
import BusinessOutlined from "@mui/icons-material/BusinessOutlined";
import AccountTreeOutlined from "@mui/icons-material/AccountTreeOutlined";
import AdminPanelSettingsOutlined from "@mui/icons-material/AdminPanelSettingsOutlined";

interface FeatureItem {
  icon: React.ReactNode;
  title: string;
  description: string;
}

export default function FeatureList() {
  const features: FeatureItem[] = [
    {
      icon: <BusinessOutlined sx={{ fontSize: 22, color: "#111827" }} />,
      title: "Organizations & branches",
      description: "Keep multiple locations grouped under one organization.",
    },
    {
      icon: <AccountTreeOutlined sx={{ fontSize: 22, color: "#111827" }} />,
      title: "Branch departments",
      description: "Organize every branch into its own departments.",
    },
    {
      icon: <AdminPanelSettingsOutlined sx={{ fontSize: 22, color: "#111827" }} />,
      title: "Scoped access",
      description: "Give organization, branch, and department admins the right level of access.",
    },
  ];

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3, width: "100%" }}>
      {features.map((item, index) => (
        <Box
          key={index}
          sx={{
            display: "flex",
            alignItems: "flex-start",
            gap: 2,
            p: 2,
            borderRadius: "8px",
            border: "1px solid #E5E7EB",
            bgcolor: "#FFFFFF",
            transition: "all 0.2s ease-in-out",
            "&:hover": {
              borderColor: "#CBD5E1",
            },
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 36,
              height: 36,
              borderRadius: "6px",
              bgcolor: "#F8FAFC",
              flexShrink: 0,
            }}
          >
            {item.icon}
          </Box>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
            <Typography
              variant="body2"
              sx={{
                fontWeight: 600,
                color: "#111827",
                fontSize: "15px",
                lineHeight: "20px",
              }}
            >
              {item.title}
            </Typography>
            <Typography
              variant="caption"
              sx={{
                fontWeight: 400,
                color: "#6B7280",
                fontSize: "13px",
                lineHeight: "18px",
              }}
            >
              {item.description}
            </Typography>
          </Box>
        </Box>
      ))}
    </Box>
  );
}
