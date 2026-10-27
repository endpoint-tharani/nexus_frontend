import { Box, Typography } from "@mui/material";

export default function SalaryImportEmptyState() {
  return (
    <Box sx={{ py: 6, textAlign: "center" }}>
      <Typography color="text.secondary" sx={{ fontWeight: 600 }}>
        No details found.
      </Typography>
    </Box>
  );
}
