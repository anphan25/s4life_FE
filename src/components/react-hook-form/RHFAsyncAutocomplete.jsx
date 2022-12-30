import { Autocomplete, FormControl, FormLabel, FormHelperText, TextField, styled } from '@mui/material';
import React, { useRef } from 'react';
import { Controller } from 'react-hook-form';

export const RHFAsyncAutoComplete = ({
  name,
  label,
  control,
  isRequiredLabel = false,
  onInput,
  onSelect,
  list,
  paramsCompare,
  ...props
}) => {
  const RequireLabel = styled('span')(({ theme }) => ({
    color: theme.palette.error.main,
  }));

  const typingTimeoutRef = useRef(null);

  return (
    <Controller
      name={name}
      control={control}
      render={({ field: { onChange, value }, fieldState: { error } }) => (
        <FormControl sx={{ mb: 2 }} fullWidth>
          <FormLabel htmlFor={name}>
            {label}
            {isRequiredLabel ? <RequireLabel>*</RequireLabel> : ''}
          </FormLabel>
          <Autocomplete
            id={name}
            {...props}
            autoHighlight
            options={list}
            filterOptions={(x) => x}
            freeSolo
            includeInputInList
            onInputChange={(e, newValue) => {
              if (!onInput) return;
              if (!newValue) return;

              if (typingTimeoutRef.current) {
                clearTimeout(typingTimeoutRef.current);
              }

              typingTimeoutRef.current = setTimeout(() => {
                onInput(newValue);
              }, 400);
            }}
            value={list?.find((item) => value && item[paramsCompare] === value[paramsCompare]) || ''}
            filterSelectedOptions
            onChange={(event, newValue) => {
              if (!newValue) return;
              onChange(newValue);
              onSelect(newValue);
            }}
            renderInput={(params) => (
              <TextField
                {...params}
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
