import { useRef, type KeyboardEvent, type ClipboardEvent } from "react";
import { Box, TextField } from "@mui/material";

interface OtpInputProps {
  value: string[];
  onChange: (value: string[]) => void;
  disabled?: boolean;
  error?: boolean;
}

export default function OtpInput({ value, onChange, disabled = false, error = false }: OtpInputProps) {
  const inputs = useRef<(HTMLInputElement | null)[]>([]);
  const OTP_LENGTH = 6;

  const handleChange = (index: number, val: string) => {
    if (!/^\d?$/.test(val)) return;
    const updated = [...value];
    updated[index] = val;
    onChange(updated);

    // Focus next input if a digit is entered
    if (val && index < OTP_LENGTH - 1) {
      inputs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !value[index] && index > 0) {
      const updated = [...value];
      updated[index - 1] = "";
      onChange(updated);
      inputs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, OTP_LENGTH);
    if (!pasted) return;
    const updated = Array(OTP_LENGTH).fill("");
    pasted.split("").forEach((char, i) => {
      updated[i] = char;
    });
    onChange(updated);

    // Focus the last filled input or the first remaining empty input
    const focusIndex = Math.min(pasted.length, OTP_LENGTH - 1);
    inputs.current[focusIndex]?.focus();
  };

  return (
    <Box sx={{ display: "flex", gap: 1, justifyContent: "space-between", width: "100%" }}>
      {Array(OTP_LENGTH)
        .fill(null)
        .map((_, i) => (
          <TextField
            key={i}
            inputRef={(el) => {
              inputs.current[i] = el;
            }}
            value={value[i] || ""}
            onChange={(e) => handleChange(i, e.target.value)}
            onKeyDown={(e) => handleKeyDown(i, e as KeyboardEvent<HTMLInputElement>)}
            onPaste={handlePaste}
            disabled={disabled}
            aria-label={`Digit ${i + 1}`}
            error={error}
            slotProps={{
              htmlInput: {
                maxLength: 1,
                inputMode: "numeric",
                style: {
                  textAlign: "center",
                  fontSize: "18px",
                  fontWeight: 600,
                  padding: "0",
                  height: "52px",
                  boxSizing: "border-box",
                },
              },
            }}
            sx={{
              width: "100%",
              maxWidth: "52px",
              "& .MuiOutlinedInput-root": {
                height: "52px",
                borderRadius: "10px",
                bgcolor: "#FFFFFF",
                "& fieldset": {
                  borderColor: error ? "#DC2626" : "#E5E7EB",
                  transition: "border-color 0.12s ease-in-out",
                },
                "&:hover fieldset": {
                  borderColor: error ? "#DC2626" : "#CBD5E1",
                },
                "&.Mui-focused fieldset": {
                  borderColor: error ? "#DC2626" : "#2563EB",
                  borderWidth: "1.5px",
                },
                "&.Mui-disabled fieldset": {
                  borderColor: "#F1F5F9",
                },
              },
            }}
          />
        ))}
    </Box>
  );
}
