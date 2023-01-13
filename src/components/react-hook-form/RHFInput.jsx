import { FormControl, TextField, FormLabel, styled } from '@mui/material';
import React from 'react';
import { Controller } from 'react-hook-form';

const RequireLabel = styled('span')(({ theme }) => ({
  color: theme.palette.error.main,
}));

export const RHFInput = ({ control, label, name, isRequiredLabel = false, ...props }) => {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => (
        <FormControl sx={{ mb: 2 }} fullWidth>
          <FormLabel htmlFor={name}>
            {label}
            {isRequiredLabel ? <RequireLabel> *</RequireLabel> : ''}
          </FormLabel>
          <TextField
            id={name}
            {...field}
            {...props}
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
