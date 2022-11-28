import { FormControl, FormHelperText, FormLabel, TextField, styled, Stack } from '@mui/material';
import React, { useState, useEffect } from 'react';
import { DesktopDatePicker } from '@mui/x-date-pickers';
import { Controller } from 'react-hook-form';

export const RHFFromToDatePicker = ({
  control,
  startDateLabel,
  endDateLabel,
  startDatePlaceholder,
  endDatePlaceholder,
  isRequiredLabel,
  startDateName,
  endDateName,
  ...props
}) => {
  const HeaderMainStyle = styled('span')(({ theme }) => ({
    color: theme.palette.error.main,
  }));

  const [params, setParams] = useState({ startDate: null, endDate: null });

  const handleStartDateChange = (newValue) => {
    setParams((old) => ({ ...old, startDate: newValue }));
  };

  const handleEndDateChange = (newValue) => {
    setParams((old) => ({ ...old, endDate: newValue }));
  };

  return (
    <Stack direction="row" spacing={2}>
      {/* <Controller
        name={startDateName}
        control={control}
        render={({ field, fieldState: { error } }) => (
          <FormControl sx={{ mb: 2 }} fullWidth>
            <FormLabel htmlFor={startDateName}>
              {startDateLabel}
              {isRequiredLabel ? <HeaderMainStyle>*</HeaderMainStyle> : ''}
            </FormLabel> */}
      <DesktopDatePicker
        id={startDateName}
        {...props}
        maxDate={params.endDate}
        value={params.startDate}
        onChange={handleStartDateChange}
        renderInput={(params) => (
          <TextField
            //   error={!!error}
            {...params}
            inputProps={{
              ...params.inputProps,
              startDatePlaceholder,
            }}
          />
        )}
        //   {...field}
      />
      {/* {!!error && (
              <FormHelperText error sx={{ mt: 0 }}>
                {error?.message?.toString()}
              </FormHelperText>
            )}
          </FormControl>
        )}
      /> */}

      {/* <Controller
        name={endDateName}
        control={control}
        render={({ field, fieldState: { error } }) => (
          <FormControl sx={{ mb: 2 }} fullWidth>
            <FormLabel htmlFor={endDateName}>
              {endDateLabel}
              {isRequiredLabel ? <HeaderMainStyle>*</HeaderMainStyle> : ''}
            </FormLabel> */}
      <DesktopDatePicker
        id={endDateName}
        {...props}
        minDate={params.startDate}
        value={params.endDate}
        onChange={handleEndDateChange}
        renderInput={(params) => (
          <TextField
            //   error={!!error}
            {...params}
            inputProps={{
              ...params.inputProps,
              endDatePlaceholder,
            }}
          />
        )}
        //   {...field}
      />
      {/* {!!error && (
              <FormHelperText error sx={{ mt: 0 }}>
                {error?.message?.toString()}
              </FormHelperText>
            )}
          </FormControl>
        )}
      /> */}
    </Stack>
  );
};
