import { FormControl, TextField, FormLabel } from '@mui/material';
import React from 'react';
import { Controller } from 'react-hook-form';
import { RequireLabel } from 'utils';

export const RHFInput = ({ control, label, name, isRequiredLabel = false, ...props }) => {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => (
        <FormControl sx={{ mb: 3 }} fullWidth>
          <FormLabel htmlFor={name}>
            {label}
            {isRequiredLabel ? <RequireLabel> *</RequireLabel> : ''}
          </FormLabel>
          <TextField
            id={name}
            {...field}
            {...props}
            sx={{ '& .css-10d4dhp-MuiInputBase-root-MuiOutlinedInput-root': { padding: '0 !important' } }}
            error={!!error}
            inputProps={{
              autoComplete: 'off',
            }}
            helperText={error?.message?.toString()}
          />
        </FormControl>
      )}
    />
  );
};
