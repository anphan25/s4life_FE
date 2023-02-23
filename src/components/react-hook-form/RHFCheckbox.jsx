import React from 'react';
import { Checkbox, FormControl, FormControlLabel, FormGroup, FormHelperText, FormLabel } from '@mui/material';
import { Controller } from 'react-hook-form';
import { RequireLabel } from 'utils';

export const RHFCheckbox = ({ control, label, name, list, isRequiredLabel, onCheck, ...props }) => {
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
