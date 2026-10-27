import type { ReactNode } from "react";
import { Box } from "@mui/material";

export interface DetailGridProps {
  children: ReactNode;
  columns?: 1 | 2 | 3;
}

export default function DetailGrid({ children, columns = 2 }: DetailGridProps) {
  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: {
          xs: "1fr",
          sm: columns === 1 ? "1fr" : columns === 3 ? "1fr 1fr 1fr" : "1fr 1fr",
        },
        rowGap: 2.5,
        columnGap: 4,
      }}
    >
      {children}
    </Box>
  );
}
