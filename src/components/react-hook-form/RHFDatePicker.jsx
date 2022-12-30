import { FormControl, FormHelperText, FormLabel, TextField, styled } from '@mui/material';
import React from 'react';
import { DatePicker } from '@mui/x-date-pickers';
import { Controller } from 'react-hook-form';
import { Icon } from 'components';

function DateIcon() {
  return <Icon icon="calendar" />;
}

export const RHFDatePicker = ({ name, control, label, placeholder, isRequiredLabel, defaultValue, ...props }) => {
  const RequireLabel = styled('span')(({ theme }) => ({
    color: theme.palette.error.main,
  }));

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => (
        <FormControl sx={{ mb: 2 }} fullWidth>
          <FormLabel htmlFor={name}>
            {label}
            {isRequiredLabel ? <RequireLabel>*</RequireLabel> : ''}
          </FormLabel>
          <DatePicker
            id={name}
            {...props}
            {...field}
            onChange={(value) => {
              field.onChange(value);
            }}
            components={{
              OpenPickerIcon: DateIcon,
            }}
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
