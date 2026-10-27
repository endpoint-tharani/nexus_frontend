import { forwardRef } from "react";
import { TextField, type TextFieldProps } from "@mui/material";

export const AuthTextField = forwardRef<HTMLDivElement, TextFieldProps>((props, ref) => {
  return (
    <TextField
      ref={ref}
      variant="outlined"
      fullWidth
      {...props}
      sx={{
        "& .MuiOutlinedInput-root": {
          height: "52px",
          borderRadius: "10px",
          bgcolor: "#FFFFFF",
          transition: "border-color 0.12s ease-in-out, box-shadow 0.12s ease-in-out",
          "& fieldset": {
            borderColor: "#E5E7EB",
            transition: "border-color 0.12s ease-in-out",
          },
          "&:hover fieldset": {
            borderColor: "#CBD5E1",
          },
          "&.Mui-focused fieldset": {
            borderColor: "#2563EB",
            borderWidth: "1.5px",
          },
          "&.Mui-disabled fieldset": {
            borderColor: "#F1F5F9",
          },
          "&.Mui-error fieldset": {
            borderColor: "#DC2626",
          },
          "& input": {
            padding: "0 14px",
            height: "52px",
            boxSizing: "border-box",
            fontSize: "15px",
            color: "#111827",
          },
          "& .MuiInputAdornment-root": {
            height: "auto",
            maxHeight: "none",
            color: "#6B7280",
          },
        },
        "& .MuiInputLabel-outlined": {
          fontSize: "15px",
          color: "#6B7280",
          transform: "translate(14px, 16px) scale(1)",
          transition: "color 0.12s, transform 0.12s",
          "&.MuiInputLabel-shrink": {
            transform: "translate(14px, -6px) scale(0.75)",
            bgcolor: "#FFFFFF",
            padding: "0 4px",
          },
          "&.Mui-focused": {
            color: "#2563EB",
          },
          "&.Mui-error": {
            color: "#DC2626",
          },
        },
        "& .MuiFormHelperText-root": {
          margin: "4px 14px 0",
          fontSize: "13px",
          lineHeight: "16px",
          "&.Mui-error": {
            color: "#DC2626",
          },
        },
        ...props.sx,
      }}
    />
  );
});

AuthTextField.displayName = "AuthTextField";

export default AuthTextField;
