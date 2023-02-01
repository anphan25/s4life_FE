import { FormControl, FormControlLabel, FormHelperText, FormLabel, Radio, RadioGroup } from '@mui/material';
import React from 'react';
import { Controller } from 'react-hook-form';
import { RequireLabel } from 'utils';

export const RHFRadio = ({ control, label, name, options, isRequiredLabel, onSelect, ...props }) => {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field: { onChange, value }, fieldState: { error } }) => (
        <FormControl sx={{ mb: 1.5 }} fullWidth>
          <FormLabel htmlFor={name}>
            {label}
            {isRequiredLabel ? <RequireLabel> *</RequireLabel> : ''}
          </FormLabel>
          <RadioGroup
            {...props}
            row
            value={value}
            onChange={(event, newValue) => {
              if (onSelect) {
                onSelect(newValue);
              }

              onChange(newValue);
            }}
          >
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
