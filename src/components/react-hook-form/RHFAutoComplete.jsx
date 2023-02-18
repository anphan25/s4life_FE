import { Autocomplete, FormControl, FormLabel, FormHelperText, TextField } from '@mui/material';
import React from 'react';
import { Controller } from 'react-hook-form';
import { RequireLabel } from 'utils';

export const RHFAutoComplete = ({
  name,
  label,
  control,
  isLazyLoad,
  onScrollToBottom,
  isRequiredLabel = false,
  list,
  paramsCompare,
  onSelect,
  ...props
}) => {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field: { onChange, value }, fieldState: { error } }) => (
        <FormControl sx={{ mb: 2 }} fullWidth>
          <FormLabel htmlFor={name}>
            {label}
            {isRequiredLabel ? <RequireLabel> *</RequireLabel> : ''}
          </FormLabel>
          <Autocomplete
            id={name}
            {...props}
            autoHighlight
            freeSolo
            options={list}
            value={list?.find((item) => value && item[paramsCompare] === value[paramsCompare]) || ''}
            filterSelectedOptions
            onChange={(event, newValue) => {
              onChange(newValue);
              if (onSelect) {
                onSelect(newValue);
              }
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                placeholder={props.placeholder || ''}
                error={!!error}
                onChange={onChange}
                inputProps={{
                  ...params.inputProps,
                  autoComplete: 'off',
                }}
              />
            )}
          />
          {!!error && (
            <FormHelperText error sx={{ mt: 1 }}>
              {error?.message?.toString()}
            </FormHelperText>
          )}
        </FormControl>
      )}
    />
  );
};
