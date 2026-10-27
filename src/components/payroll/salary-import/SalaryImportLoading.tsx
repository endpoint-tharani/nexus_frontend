import { Box, CircularProgress } from "@mui/material";

export default function SalaryImportLoading() {
  return (
    <Box sx={{ py: 6, textAlign: "center" }}>
      <CircularProgress />
    </Box>
  );
}
