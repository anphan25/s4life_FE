import { FormControl, TextField, FormLabel, styled, IconButton, InputAdornment } from '@mui/material';
import React, { useState } from 'react';
import { Controller } from 'react-hook-form';
import { MdVisibilityOff, MdVisibility } from 'react-icons/md';

const RequireLabel = styled('span')(({ theme }) => ({
  color: theme.palette.error.main,
}));

export const RHFPasswordInput = ({ control, label, name, isRequiredLabel, ...props }) => {
  const [showPassword, setShowPassword] = useState(false);
  const handleClickShowPassword = () => setShowPassword(!showPassword);
  const handleMouseDownPassword = () => setShowPassword(!showPassword);
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
                  <IconButton
                    aria-label="toggle password visibility"
                    onClick={handleClickShowPassword}
                    onMouseDown={handleMouseDownPassword}
                  >
                    {showPassword ? <MdVisibility /> : <MdVisibilityOff />}
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
