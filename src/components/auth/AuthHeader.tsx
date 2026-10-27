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
          fontSize: { xs: "1.75rem", sm: "2rem" },
          lineHeight: 1.2,
          color: "text.primary",
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
            fontSize: "1rem",
            lineHeight: 1.6,
            color: "text.secondary",
          }}
        >
          {subtitle}
        </Typography>
      )}
    </Box>
  );
}
