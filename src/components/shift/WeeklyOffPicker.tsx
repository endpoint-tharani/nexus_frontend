import { Box, Chip, Stack, ToggleButton, ToggleButtonGroup, Typography } from "@mui/material";
import { WEEKDAYS, WEEKLY_OFF_PRESETS } from "../../constants/enums";

export interface WeeklyOffPickerProps {
  // 7-char Sun..Sat pattern, '1' = weekly off.
  value: string;
  onChange: (pattern: string) => void;
  disabled?: boolean;
  error?: string;
}

const safePattern = (value: string): string =>
  value.length === 7 && /^[01]{7}$/.test(value) ? value : "0000000";

// Weekly-off editor: a 7-day toggle row backed by the raw pattern string, plus a
// few one-click presets. Fully controlled — the parent owns the pattern.
export default function WeeklyOffPicker({
  value,
  onChange,
  disabled = false,
  error,
}: WeeklyOffPickerProps) {
  const pattern = safePattern(value);
  const selected = WEEKDAYS.filter((d) => pattern[d.index] === "1").map(
    (d) => d.index
  );

  const handleToggle = (_event: unknown, next: number[]) => {
    const chars = "0000000".split("");
    next.forEach((index) => {
      chars[index] = "1";
    });
    onChange(chars.join(""));
  };

  return (
    <Box>
      <Typography
        variant="body2"
        color="text.secondary"
        sx={{ mb: 1, fontWeight: 600 }}
      >
        Weekly off days
      </Typography>

      <ToggleButtonGroup
        value={selected}
        onChange={handleToggle}
        disabled={disabled}
        size="small"
        sx={{ flexWrap: "wrap", gap: 0.5 }}
      >
        {WEEKDAYS.map((day) => (
          <ToggleButton
            key={day.index}
            value={day.index}
            aria-label={day.label}
            sx={{ px: 1.5, border: "1px solid", borderColor: "divider", borderRadius: 1 }}
          >
            {day.short}
          </ToggleButton>
        ))}
      </ToggleButtonGroup>

      <Stack direction="row" spacing={1} sx={{ mt: 1.5, flexWrap: "wrap", gap: 1 }}>
        {WEEKLY_OFF_PRESETS.map((preset) => (
          <Chip
            key={preset.value}
            label={preset.label}
            size="small"
            variant={pattern === preset.value ? "filled" : "outlined"}
            color={pattern === preset.value ? "primary" : "default"}
            onClick={disabled ? undefined : () => onChange(preset.value)}
            disabled={disabled}
          />
        ))}
      </Stack>

      {error && (
        <Typography variant="caption" color="error" sx={{ mt: 0.5, display: "block" }}>
          {error}
        </Typography>
      )}
    </Box>
  );
}
