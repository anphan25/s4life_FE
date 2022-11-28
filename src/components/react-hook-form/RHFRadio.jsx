import { FormControl, FormControlLabel, styled, FormHelperText, FormLabel, Radio, RadioGroup } from '@mui/material';
import React from 'react';
import { Controller } from 'react-hook-form';

const HeaderMainStyle = styled('span')(({ theme }) => ({
  color: theme.palette.error.main,
}));

export const RHFRadio = ({ control, label, name, options, isRequiredLabel, ...props }) => {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => (
        <FormControl sx={{ mb: 1.5 }} fullWidth>
          <FormLabel htmlFor={name}>
            {label}
            {isRequiredLabel ? <HeaderMainStyle>*</HeaderMainStyle> : ''}
          </FormLabel>
          <RadioGroup {...field} {...props} row>
            {options.map((option) => (
              <FormControlLabel
                key={option.id}
                value={option.value}
                control={<Radio sx={{ color: 'grey.600', p: '6px' }} />}
                label={option.label}
              />
            ))}
          </RadioGroup>
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
