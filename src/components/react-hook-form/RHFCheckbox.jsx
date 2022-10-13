import React from "react";
import {
  Checkbox,
  FormControl,
  FormControlLabel,
  FormGroup,
  FormHelperText,
  InputLabel,
} from "@mui/material";
import { Controller } from "react-hook-form";

export const RHFCheckbox = ({ control, label, name, list, ...props }) => {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => (
        <FormControl sx={{ mb: 2 }} fullWidth>
          <InputLabel htmlFor={name}>{label}</InputLabel>
          <FormGroup>
            {list?.map((item) => (
              <FormControlLabel
                {...props}
                control={<Checkbox {...field} />}
                label={item}
                key={item}
                sx={{ whiteSpace: "noWrap" }}
              />
            ))}
          </FormGroup>

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
