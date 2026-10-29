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
        bgcolor: "primary.main",
        color: "primary.contrastText",
        fontWeight: 600,
        fontSize: "15px",
        textTransform: "none",
        boxShadow: "none",
        transition: "background-color 0.12s ease-in-out, opacity 0.12s ease-in-out",
        "&:hover": {
          bgcolor: "primary.dark",
          boxShadow: "none",
        },
        "&:active": {
          bgcolor: "primary.dark",
        },
        "&.Mui-disabled": {
          bgcolor: "primary.main",
          color: "primary.contrastText",
          opacity: 0.6,
        },
        ...props.sx,
      }}
    >
      {loading ? <CircularProgress size={20} color="inherit" /> : children}
    </Button>
  );
}
