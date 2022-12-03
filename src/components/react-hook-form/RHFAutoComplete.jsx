import { Autocomplete, FormControl, FormLabel, FormHelperText, TextField, styled } from '@mui/material';
import React, { useState, useEffect } from 'react';
import { Controller } from 'react-hook-form';

export const RHFAutoComplete = ({
  name,
  label,
  control,
  isLazyLoad,
  onScrollToBottom,
  isRequiredLabel = false,
  list,
  ...props
}) => {
  const [isAtBottom, setIsAtBottom] = useState(false);
  const [scrollTop, setScrollTop] = useState();
  const [size, setSize] = useState(10);

  const HeaderMainStyle = styled('span')(({ theme }) => ({
    color: theme.palette.error.main,
  }));

  useEffect(() => {
    onScrollToBottom({ PageSize: size, Page: 1, SearchKey: '' });
  }, [size]);

  return (
    <Controller
      name={name}
      control={control}
      render={({ field: { onChange, value }, fieldState: { error } }) => (
        <FormControl sx={{ mb: 2 }} fullWidth>
          <FormLabel htmlFor={name}>
            {label}
            {isRequiredLabel ? <HeaderMainStyle>*</HeaderMainStyle> : ''}
          </FormLabel>
          <Autocomplete
            id={name}
            {...props}
            // {...field}
            autoHighlight
            options={list}
            freeSolo
            ListboxProps={{
              onScroll: (event) => {
                if (isLazyLoad) {
                  const listboxNode = event.currentTarget;

                  if (Math.round(listboxNode.scrollTop) + listboxNode.clientHeight === listboxNode.scrollHeight) {
                    setIsAtBottom(true);
                    setSize(size + 10);
                    onScrollToBottom(size, '');

                    if (isAtBottom) {
                      listboxNode.scrollTop = listboxNode.scrollHeight - 50 * 20;
                      // setScrollTop(listboxNode.scrollHeight - 50 * 20);

                      setIsAtBottom(false);
                    }
                  }
                }
              },
            }}
            onInputChange={(e, value) => {
              // if (isLazyLoad) {
              //   setTimeout(() => {
              //     onScrollToBottom({ PageSize: size, Page: 1, SearchKey: value });
              //   }, [300]);
              // }
            }}
            // defaultChecked={value}
            // isOptionEqualToValue={(option, value) => option.value == value.value}
            value={value || null}
            filterSelectedOptions
            // defaultValue={list.find((item) => item?.value === value)}
            // getOptionSelected={(option) => option?.value === value}
            // isOptionEqualToValue={(option) => option?.value === value}
            onChange={(event, newValue) => onChange(newValue)}
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
