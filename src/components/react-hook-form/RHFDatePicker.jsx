import {
  FormControl,
  FormHelperText,
  InputLabel,
  TextField,
} from "@mui/material";
import React from "react";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { Controller } from "react-hook-form";

export const RHFDatePicker = ({ name, control, label, ...props }) => {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => (
        <FormControl sx={{ mb: 2 }} fullWidth>
          <InputLabel htmlFor={name}>{label}</InputLabel>
          <DatePicker
            id={name}
            onChange={(newValue) => {
              field.onChange(newValue);
            }}
            renderInput={(params) => <TextField {...params} />}
            {...field}
          />

          {!!error && (
            <FormHelperText error sx={{ mt: 0 }}>
              {error?.message?.toString()}
            </FormHelperText>
          )}
        </FormControl>
      )}
    />
  );
};
