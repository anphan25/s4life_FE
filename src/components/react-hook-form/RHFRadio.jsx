import { FormControl, FormControlLabel, FormHelperText, FormLabel, Radio, RadioGroup } from '@mui/material';
import React from 'react';
import { Controller } from 'react-hook-form';
import { RequireLabel } from 'utils';

export const RHFRadio = ({ control, label, name, options, isRequiredLabel, onSelect, getOptionLabel, ...props }) => {
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
            defaultValue={props?.defaultValue}
            value={value || null}
            onChange={(event, newValue) => {
              if (onSelect) {
                onSelect(newValue);
              }

              onChange(newValue);
            }}
          >
            {options.map((option, i) => (
              <FormControlLabel
                key={option}
                value={option}
                control={<Radio sx={{ color: 'grey.600', p: '6px' }} />}
                label={getOptionLabel?.length ? getOptionLabel[i] : option}
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
