import React from "react";
import { Button, CircularProgress, type ButtonProps } from "@mui/material";

interface PrimaryButtonProps extends ButtonProps {
  loading?: boolean;
  children: React.ReactNode;
}

export default function PrimaryButton({ loading = false, children, ...props }: PrimaryButtonProps) {
  return (
    <Button
      variant="contained"
      size="large"
      type="submit"
      fullWidth
      {...props}
      disabled={props.disabled || loading}
      sx={{
        height: "48px",
        borderRadius: "10px",
        bgcolor: "#2563EB",
        color: "#FFFFFF",
        fontWeight: 600,
        fontSize: "15px",
        textTransform: "none",
        boxShadow: "none",
        transition: "background-color 0.12s ease-in-out, opacity 0.12s ease-in-out",
        "&:hover": {
          bgcolor: "#1D4ED8",
          boxShadow: "none",
        },
        "&:active": {
          bgcolor: "#1E40AF",
        },
        "&.Mui-disabled": {
          bgcolor: "#2563EB",
          color: "#FFFFFF",
          opacity: 0.6,
        },
        ...props.sx,
      }}
    >
      {loading ? <CircularProgress size={20} color="inherit" /> : children}
    </Button>
  );
}
