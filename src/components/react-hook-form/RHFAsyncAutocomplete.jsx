import { Autocomplete, FormControl, FormLabel, FormHelperText, TextField } from '@mui/material';
import React, { useRef, useState, useEffect } from 'react';
import { Controller } from 'react-hook-form';
import { RequireLabel } from 'utils';

export const RHFAsyncAutoComplete = ({
  name,
  label,
  control,
  isRequiredLabel = false,
  isLazyLoad = false,
  onInput,
  onSelect,
  list,
  paramsCompare,
  onScrollToBottom,
  ...props
}) => {
  const [size, setSize] = useState(10);

  const typingTimeoutRef = useRef(null);

  useEffect(() => {
    if (!onScrollToBottom || size <= 10) return;
    onScrollToBottom(size);
  }, [size]);

  return (
    <Controller
      name={name}
      control={control}
      render={({ field: { onChange, value }, fieldState: { error } }) => (
        <FormControl sx={{ mb: 3 }} fullWidth>
          <FormLabel htmlFor={name}>
            {label}
            {isRequiredLabel ? <RequireLabel> *</RequireLabel> : ''}
          </FormLabel>
          <Autocomplete
            id={name}
            {...props}
            options={list}
            ListboxProps={{
              role: 'list-box',
              onScroll: (event) => {
                if (!isLazyLoad) return;
                if (!onScrollToBottom) return;

                const listboxNode = event.currentTarget;
                if (Math.round(listboxNode.scrollTop) + listboxNode.clientHeight === listboxNode.scrollHeight) {
                  const top = listboxNode.scrollTop;
                  setSize(size + 10);

                  listboxNode.scrollTo({ top });
                }
              },
            }}
            freeSolo
            filterOptions={(x) => x}
            includeInputInList
            onInputChange={(e, newValue) => {
              if (!onInput) return;

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
              onChange(newValue);
              if (!onSelect) return;
              onSelect(newValue);
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
