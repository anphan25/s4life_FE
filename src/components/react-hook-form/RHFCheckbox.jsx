import React from 'react';
import { Checkbox, FormControl, FormControlLabel, FormGroup, FormHelperText, styled, FormLabel } from '@mui/material';
import { Controller } from 'react-hook-form';

const HeaderMainStyle = styled('span')(({ theme }) => ({
  color: theme.palette.error.main,
}));

export const RHFCheckbox = ({ control, label, name, list, isRequiredLabel, onCheck, ...props }) => {
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
          <FormGroup>
            {list?.map((item) => (
              <FormControlLabel
                {...props}
                control={
                  <Checkbox
                    {...field}
                    onChange={(e, newValue) => {
                      onCheck(newValue);
                      field.onChange(newValue);
                    }}
                  />
                }
                label={item}
                key={item}
                sx={{ whiteSpace: 'noWrap' }}
              />
            ))}
          </FormGroup>

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
