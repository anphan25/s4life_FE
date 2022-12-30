import { FormControl, TextField, FormLabel, styled, IconButton, InputAdornment } from '@mui/material';
import { Icon } from 'components';
import React, { useState } from 'react';
import { Controller } from 'react-hook-form';

const RequireLabel = styled('span')(({ theme }) => ({
  color: theme.palette.error.main,
}));

export const RHFPasswordInput = ({ control, label, name, isRequiredLabel, ...props }) => {
  const [showPassword, setShowPassword] = useState(false);
  const handleClickShowPassword = () => setShowPassword(!showPassword);
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
          <TextField
            id={name}
            {...field}
            {...props}
            type={showPassword ? 'text' : 'password'}
            error={!!error}
            helperText={error?.message?.toString()}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={handleClickShowPassword}>
                    <Icon icon={!showPassword ? 'eye' : 'eye-slash'} size={20} />
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
        </FormControl>
      )}
    />
  );
};
