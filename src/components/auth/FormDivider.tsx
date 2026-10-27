import { Box, Typography } from "@mui/material";

export default function FormDivider() {
  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 2, my: 1, width: "100%" }}>
      <Box sx={{ flexGrow: 1, height: "1px", bgcolor: "#E5E7EB" }} />
      <Typography
        variant="caption"
        sx={{
          color: "#94A3B8",
          fontWeight: 600,
          fontSize: "12px",
          letterSpacing: "0.05em",
          textTransform: "uppercase",
        }}
      >
        OR
      </Typography>
      <Box sx={{ flexGrow: 1, height: "1px", bgcolor: "#E5E7EB" }} />
    </Box>
  );
}
