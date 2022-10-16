import { FormControl, FormControlLabel, TextField } from '@mui/material';
import React from 'react';
import { Controller } from 'react-hook-form';

export const RHFInput = ({ control, label, name, ...props }) => {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => (
        <FormControl sx={{ mb: 2 }} fullWidth>
          <FormControlLabel htmlFor={name}>{label}</FormControlLabel>
          <TextField id={name} {...field} {...props} error={!!error} helperText={error?.message?.toString()} />
        </FormControl>
      )}
    />
  );
};
