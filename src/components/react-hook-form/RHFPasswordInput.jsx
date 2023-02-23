import { FormControl, TextField, FormLabel, IconButton, InputAdornment } from '@mui/material';
import { Icon } from 'components';
import React, { useState } from 'react';
import { Controller } from 'react-hook-form';
import { RequireLabel } from 'utils';

export const RHFPasswordInput = ({ control, label, name, isRequiredLabel, ...props }) => {
  const [showPassword, setShowPassword] = useState(false);
  const handleClickShowPassword = () => setShowPassword(!showPassword);
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
            type={showPassword ? 'text' : 'password'}
            error={!!error}
            helperText={error?.message?.toString()}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end" sx={{ ml: 0 }}>
                  <IconButton onClick={handleClickShowPassword} sx={{ p: 0 }}>
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
