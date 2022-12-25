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
            onInputChange={(e, value) => {
              if (!onInput) return;

              if (typingTimeoutRef.current) {
                clearTimeout(typingTimeoutRef.current);
              }

              typingTimeoutRef.current = setTimeout(() => {
                onInput(value);
              }, 400);
            }}
            value={list.find((item) => item === value)}
            filterSelectedOptions
            onChange={(event, newValue) => {
              onChange(newValue);
              onSelect(newValue?.placeId);
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
