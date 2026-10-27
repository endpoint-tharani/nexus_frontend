import { useState, forwardRef } from "react";
import { IconButton, InputAdornment, type TextFieldProps } from "@mui/material";
import LockOutlined from "@mui/icons-material/LockOutlined";
import VisibilityOutlined from "@mui/icons-material/VisibilityOutlined";
import VisibilityOffOutlined from "@mui/icons-material/VisibilityOffOutlined";
import AuthTextField from "./AuthTextField";

export const PasswordField = forwardRef<HTMLDivElement, TextFieldProps>((props, ref) => {
  const [showPassword, setShowPassword] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  return (
    <AuthTextField
      ref={ref}
      type={showPassword ? "text" : "password"}
      {...props}
      slotProps={{
        input: {
          startAdornment: (
            <InputAdornment position="start" sx={{ pl: 0.5, pr: 0.5 }}>
              <LockOutlined sx={{ fontSize: 20, color: "#6B7280" }} />
            </InputAdornment>
          ),
          endAdornment: (
            <InputAdornment position="end" sx={{ pr: 0.5 }}>
              <IconButton
                onClick={togglePasswordVisibility}
                edge="end"
                aria-label={showPassword ? "Hide password" : "Show password"}
                sx={{
                  color: "#6B7280",
                  padding: "8px",
                  "&:hover": {
                    color: "#111827",
                    bgcolor: "rgba(0, 0, 0, 0.04)",
                  },
                }}
              >
                {showPassword ? (
                  <VisibilityOffOutlined sx={{ fontSize: 20 }} />
                ) : (
                  <VisibilityOutlined sx={{ fontSize: 20 }} />
                )}
              </IconButton>
            </InputAdornment>
          ),
        },
      }}
    />
  );
});

PasswordField.displayName = "PasswordField";

export default PasswordField;
