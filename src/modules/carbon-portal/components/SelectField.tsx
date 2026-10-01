"use client";

import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";

export type SelectOption = {
  value: string;
  label: string;
};

type SelectFieldProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  emptyLabel?: string;
  required?: boolean;
  disabled?: boolean;
};

export function SelectField({
  label,
  value,
  onChange,
  options,
  emptyLabel,
  required = false,
  disabled = false,
}: SelectFieldProps) {
  const id = `field-${label.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}`;
  return (
    <FormControl fullWidth size="small" required={required} disabled={disabled}>
      <InputLabel id={`${id}-label`}>{label}</InputLabel>
      <Select
        labelId={`${id}-label`}
        id={id}
        label={label}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      >
        {emptyLabel ? (
          <MenuItem value="">
            <em>{emptyLabel}</em>
          </MenuItem>
        ) : null}
        {options.map((option) => (
          <MenuItem key={option.value} value={option.value}>
            {option.label}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}
