import React from "react";
import { Button, CircularProgress, type ButtonProps } from "@mui/material";

interface SecondaryButtonProps extends ButtonProps {
  loading?: boolean;
  children: React.ReactNode;
}

export default function SecondaryButton({ loading = false, children, ...props }: SecondaryButtonProps) {
  return (
    <Button
      variant="outlined"
      size="large"
      fullWidth
      {...props}
      disabled={props.disabled || loading}
      sx={{
        height: "48px",
        borderRadius: "10px",
        borderColor: "#E5E7EB",
        bgcolor: "transparent",
        color: "#111827",
        fontWeight: 600,
        fontSize: "15px",
        textTransform: "none",
        transition: "all 0.12s ease-in-out",
        "&:hover": {
          borderColor: "#CBD5E1",
          bgcolor: "#F8FAFC",
        },
        "&:active": {
          bgcolor: "#F1F5F9",
        },
        "&.Mui-disabled": {
          borderColor: "#F1F5F9",
          color: "#94A3B8",
          opacity: 0.6,
        },
        ...props.sx,
      }}
    >
      {loading ? <CircularProgress size={20} color="inherit" /> : children}
    </Button>
  );
}
