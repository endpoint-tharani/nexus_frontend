import { Box, Typography, Link, useTheme } from "@mui/material";
import { Logo } from "../common";
import FeatureList from "./FeatureList";

export default function BrandPanel() {
  const currentYear = new Date().getFullYear();
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        height: "100%",
        minHeight: { md: "calc(100vh - 96px)" },
        p: { xs: 3, md: 4 },
      }}
    >
      {/* Top Brand Info */}
      <Box sx={{ display: "flex", flexDirection: "column", gap: 5 }}>
        {/* Logo and Badge */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, flexWrap: "wrap" }}>
          <Logo size={28} onDark={isDark} />
          <Box
            sx={{
              display: "inline-flex",
              alignItems: "center",
              px: 1.5,
              py: 0.5,
              borderRadius: "99px",
              bgcolor: theme.palette.mode === "light" ? "grey.100" : "grey.900",
              border: "1px solid",
              borderColor: "divider",
            }}
          >
            <Typography
              variant="caption"
              sx={{
                fontWeight: 600,
                color: "text.secondary",
                letterSpacing: "0.05em",
                fontSize: "11px",
                textTransform: "uppercase",
              }}
            >
              AURONOX ORGANIZATION
            </Typography>
          </Box>
        </Box>

        {/* Heading & Short Description */}
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <Typography
            variant="h1"
            sx={{
              fontWeight: 700,
              fontSize: "36px",
              lineHeight: "44px",
              color: "text.primary",
              letterSpacing: "-0.02em",
            }}
          >
            Organization Management
          </Typography>
          <Typography
            variant="body1"
            sx={{
              fontWeight: 400,
              fontSize: "15px",
              lineHeight: "24px",
              color: "text.secondary",
              maxWidth: "460px",
            }}
          >
            Organize multiple branches and departments in one secure workspace with access scoped to the right level.
          </Typography>
        </Box>

        {/* Feature Cards */}
        <FeatureList />
      </Box>

      {/* Footer Info */}
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          alignItems: { xs: "flex-start", sm: "center" },
          justifyContent: "space-between",
          gap: 2,
          pt: 4,
          borderTop: "1px solid",
          borderColor: "divider",
          mt: 4,
        }}
      >
        <Typography
          variant="caption"
          sx={{
            fontWeight: 400,
            fontSize: "13px",
            color: "text.secondary",
          }}
        >
          &copy; {currentYear} Auronox. All rights reserved.
        </Typography>

        <Box sx={{ display: "flex", alignItems: "center", gap: 2.5 }}>
          <Link
            href="#"
            underline="hover"
            sx={{
              fontWeight: 500,
              fontSize: "13px",
              color: "text.secondary",
              "&:hover": { color: "text.primary" },
            }}
          >
            Privacy Policy
          </Link>
          <Link
            href="#"
            underline="hover"
            sx={{
              fontWeight: 500,
              fontSize: "13px",
              color: "text.secondary",
              "&:hover": { color: "text.primary" },
            }}
          >
            Terms of Service
          </Link>
          <Typography
            variant="caption"
            sx={{
              fontWeight: 400,
              fontSize: "13px",
              color: "text.disabled",
            }}
          >
            v1.0.0
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}
