import {
  Box,
  Button,
  Checkbox,
  Chip,
  FormControl,
  FormControlLabel,
  FormHelperText,
  FormLabel,
  MenuItem,
  Radio,
  RadioGroup,
  TextField,
} from "@mui/material";
import { MdAttachFile } from "react-icons/md";

import type { StructuredFormField } from "../../types";

export interface DynamicFieldProps {
  field: StructuredFormField;
  value: string;
  onChange: (value: string) => void;
  onFileChange?: (file: File | null) => void;
  disabled?: boolean;
  error?: string;
}

// Renders one schema-driven field as the right MUI control. Values are always
// strings (the entry value map + upsert payload are string-keyed); numeric
// parsing happens server-side.
export default function DynamicField({
  field,
  value,
  onChange,
  onFileChange,
  disabled,
  error,
}: DynamicFieldProps) {
  const label = field.label + (field.isRequired ? " *" : "");
  const helper = error ?? field.helpText ?? " ";

  switch (field.fieldType) {
    case "DROPDOWN":
      return (
        <TextField
          select
          fullWidth
          size="small"
          label={label}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          error={!!error}
          helperText={helper}
        >
          <MenuItem value="">Select…</MenuItem>
          {field.options.map((o) => (
            <MenuItem key={o.value} value={o.value}>
              {o.label}
            </MenuItem>
          ))}
        </TextField>
      );

    case "RADIO":
      return (
        <FormControl error={!!error} disabled={disabled}>
          <FormLabel sx={{ fontSize: 14 }}>{label}</FormLabel>
          <RadioGroup
            row
            value={value}
            onChange={(e) => onChange(e.target.value)}
          >
            {field.options.map((o) => (
              <FormControlLabel
                key={o.value}
                value={o.value}
                control={<Radio size="small" />}
                label={o.label}
              />
            ))}
          </RadioGroup>
          <FormHelperText>{helper}</FormHelperText>
        </FormControl>
      );

    case "CHECKBOX":
      return (
        <FormControl error={!!error} disabled={disabled}>
          <FormControlLabel
            control={
              <Checkbox
                size="small"
                checked={value === "true"}
                onChange={(e) => onChange(e.target.checked ? "true" : "false")}
              />
            }
            label={label}
          />
          <FormHelperText>{helper}</FormHelperText>
        </FormControl>
      );

    case "TEXTAREA":
      return (
        <TextField
          fullWidth
          size="small"
          multiline
          minRows={2}
          label={label}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          placeholder={field.placeholder ?? undefined}
          error={!!error}
          helperText={helper}
        />
      );

    case "FILE":
      return (
        <FormControl error={!!error} disabled={disabled}>
          <FormLabel sx={{ fontSize: 14, mb: 0.5 }}>{label}</FormLabel>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
            <Button
              component="label"
              size="small"
              variant="outlined"
              disabled={disabled}
              startIcon={<MdAttachFile size={16} />}
            >
              {value ? "Replace" : "Choose file"}
              <input
                type="file"
                hidden
                accept=".jpg,.jpeg,.png,.pdf"
                onChange={(e) => {
                  const file = e.target.files?.[0] ?? null;
                  if (file) {
                    onChange(file.name);
                    onFileChange?.(file);
                  }
                  e.target.value = "";
                }}
              />
            </Button>
            {value && (
              <Chip
                size="small"
                label={value}
                onDelete={
                  disabled
                    ? undefined
                    : () => {
                        onChange("");
                        onFileChange?.(null);
                      }
                }
              />
            )}
          </Box>
          <FormHelperText>{helper}</FormHelperText>
        </FormControl>
      );

    default: {
      // TEXT, NUMBER, AMOUNT, DATE
      const type =
        field.fieldType === "AMOUNT" || field.fieldType === "NUMBER"
          ? "number"
          : field.fieldType === "DATE"
            ? "date"
            : "text";
      return (
        <TextField
          fullWidth
          size="small"
          type={type}
          label={label}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          placeholder={field.placeholder ?? undefined}
          error={!!error}
          helperText={helper}
          slotProps={
            type === "date" ? { inputLabel: { shrink: true } } : undefined
          }
        />
      );
    }
  }
}
