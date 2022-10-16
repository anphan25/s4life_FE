import { Autocomplete, FormControl, FormControlLabel, FormHelperText, TextField } from '@mui/material';
import React from 'react';
import { Controller } from 'react-hook-form';

export const RHFAutoComplete = ({ name, label, control, ...props }) => {
  return (
    <Controller
      render={({ field, fieldState: { error } }) => (
        <FormControl sx={{ mb: 2 }} fullWidth>
          <FormControlLabel htmlFor={name}>{label}</FormControlLabel>
          <Autocomplete id={name} {...props} {...field} renderInput={(params) => <TextField {...params} />} />
          {!!error && (
            <FormHelperText error sx={{ mt: 1 }}>
              {error?.message?.toString()}
            </FormHelperText>
          )}
        </FormControl>
      )}
      onChange={([, data]) => data}
      name={name}
      control={control}
    />
  );
};
