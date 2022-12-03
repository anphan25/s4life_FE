import { FormControl, FormHelperText, FormLabel, TextField, styled } from '@mui/material';
import React from 'react';
import { TimePicker } from '@mui/x-date-pickers';
import { Controller } from 'react-hook-form';

const HeaderMainStyle = styled('span')(({ theme }) => ({
  color: theme.palette.error.main,
}));

export const RHFTimePicker = ({ name, control, label, placeholder, isRequiredLabel, ...props }) => {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => (
        <FormControl sx={{ mb: 2 }} fullWidth>
          <FormLabel htmlFor={name}>
            {label}
            {isRequiredLabel ? <HeaderMainStyle>*</HeaderMainStyle> : ''}
          </FormLabel>
          <TimePicker
            id={name}
            {...props}
            // onChange={(newValue) => {
            //   field.onChange(newValue);
            // }}
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
