import { useCallback, useEffect, useRef, useState } from "react";
import type { ChangeEvent } from "react";
import { IconButton, InputAdornment, TextField } from "@mui/material";
import { MdClose, MdSearch } from "react-icons/md";
import type { SxProps, Theme } from "@mui/material/styles";

export interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  /** Debounce delay in ms. 0 = no debounce (controlled). Default 250ms. */
  debounce?: number;
  autoFocus?: boolean;
  size?: "small" | "medium";
  fullWidth?: boolean;
  sx?: SxProps<Theme>;
  id?: string;
  "aria-label"?: string;
}

/**
 * Consistent search text field with a leading search icon, an inline clear
 * button, and optional debouncing. Used in every FilterBar so the search
 * experience is identical across all list screens.
 */
export default function SearchInput({
  value,
  onChange,
  placeholder = "Search…",
  debounce = 250,
  autoFocus = false,
  size = "small",
  fullWidth = false,
  sx,
  id,
  "aria-label": ariaLabel = "Search",
}: SearchInputProps) {
  // Internal buffered value so keystrokes feel instant while the debounced
  // onChange fires after the user pauses.
  const [draft, setDraft] = useState(value);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Keep draft in sync when the parent resets the value (e.g. "clear filters").
  useEffect(() => {
    setDraft(value);
  }, [value]);

  const flush = useCallback(
    (next: string) => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (debounce === 0) {
        onChange(next);
      } else {
        timerRef.current = setTimeout(() => onChange(next), debounce);
      }
    },
    [debounce, onChange]
  );

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const next = e.target.value;
    setDraft(next);
    flush(next);
  };

  const handleClear = () => {
    setDraft("");
    if (timerRef.current) clearTimeout(timerRef.current);
    onChange("");
  };

  return (
    <TextField
      id={id}
      size={size}
      value={draft}
      onChange={handleChange}
      placeholder={placeholder}
      autoFocus={autoFocus}
      fullWidth={fullWidth}
      aria-label={ariaLabel}
      slotProps={{
        input: {
          startAdornment: (
            <InputAdornment position="start">
              <MdSearch size={18} style={{ color: "var(--mui-palette-text-secondary)" }} />
            </InputAdornment>
          ),
          endAdornment: draft ? (
            <InputAdornment position="end">
              <IconButton
                size="small"
                onClick={handleClear}
                aria-label="Clear search"
                edge="end"
                sx={{ mr: -0.5 }}
              >
                <MdClose size={16} />
              </IconButton>
            </InputAdornment>
          ) : undefined,
        },
      }}
      sx={{
        "& .MuiOutlinedInput-root": {
          borderRadius: "8px",
          bgcolor: "background.paper",
          "& fieldset": { borderColor: "#E5E7EB" },
          "&:hover fieldset": { borderColor: "#CBD5E1" },
          "&.Mui-focused fieldset": { borderColor: "primary.main" },
        },
        ...sx,
      }}
    />
  );
}
