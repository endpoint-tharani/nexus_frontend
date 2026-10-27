import { Box, Typography } from "@mui/material";

interface AuthHeaderProps {
  title: string;
  subtitle?: string;
}

export default function AuthHeader({ title, subtitle }: AuthHeaderProps) {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 1, mb: 1 }}>
      <Typography
        variant="h2"
        component="h1"
        sx={{
          fontWeight: 700,
          fontSize: "36px",
          lineHeight: "44px",
          color: "#111827",
          letterSpacing: "-0.02em",
        }}
      >
        {title}
      </Typography>
      {subtitle && (
        <Typography
          variant="body1"
          sx={{
            fontWeight: 400,
            fontSize: "18px",
            lineHeight: "26px",
            color: "#6B7280",
          }}
        >
          {subtitle}
        </Typography>
      )}
    </Box>
  );
}
