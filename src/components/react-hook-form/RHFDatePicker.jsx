import { FormControl, FormHelperText, FormLabel, TextField, styled } from '@mui/material';
import React from 'react';
import { DesktopDatePicker } from '@mui/x-date-pickers';
import { Controller } from 'react-hook-form';
import moment from 'moment';

export const RHFDatePicker = ({ name, control, label, placeholder, isRequiredLabel, defaultValue, ...props }) => {
  const HeaderMainStyle = styled('span')(({ theme }) => ({
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
            {isRequiredLabel ? <HeaderMainStyle>*</HeaderMainStyle> : ''}
          </FormLabel>
          <DesktopDatePicker
            id={name}
            {...props}
            // defaultValue
            renderInput={(params) => (
              <TextField
                error={!!error}
                // value={moment(defaultValue).format('DD/MM/YYYY')}
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
