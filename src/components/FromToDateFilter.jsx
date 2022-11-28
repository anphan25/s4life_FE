import { Stack, TextField, Box } from '@mui/material';
import { useState, useEffect } from 'react';
import { DatePicker, DesktopDatePicker } from '@mui/x-date-pickers';

export const FromToDateFilter = ({ onChange, sx }) => {
  const [params, setParams] = useState({ startDate: null, endDate: null });

  const handleStartDateChange = (newValue) => {
    setParams((old) => ({ ...old, startDate: newValue }));
  };

  const handleEndDateChange = (newValue) => {
    setParams((old) => ({ ...old, endDate: newValue }));
  };

  useEffect(() => {
    onChange(params);
  }, [params]);

  return (
    <Stack direction="row" spacing={'10px'} sx={sx}>
      <DesktopDatePicker
        maxDate={params.endDate}
        value={params.startDate}
        onChange={handleStartDateChange}
        renderInput={(params) => (
          <TextField
            {...params}
            sx={{ width: '50%' }}
            inputProps={{
              ...params.inputProps,
              placeholder: 'Từ ngày',
            }}
          />
        )}
      />

      <DesktopDatePicker
        minDate={params.startDate}
        value={params.endDate}
        onChange={handleEndDateChange}
        renderInput={(params) => (
          <TextField
            {...params}
            sx={{ width: '50%' }}
            inputProps={{
              ...params.inputProps,
              placeholder: 'Đến ngày',
            }}
          />
        )}
      />
    </Stack>
  );
};
