import { FormControl, FormHelperText, FormLabel, TextField } from '@mui/material';
import React from 'react';
import { TimePicker } from '@mui/x-date-pickers';
import { Controller } from 'react-hook-form';
import { RequireLabel } from 'utils';

export const RHFTimePicker = ({ name, control, label, placeholder, isRequiredLabel, ...props }) => {
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
          <TimePicker
            id={name}
            {...props}
            renderInput={(params) => (
              <TextField
                error={!!error}
                {...params}
                inputProps={{
                  ...params.inputProps,
                  placeholder,
                }}
              />
            )}
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
