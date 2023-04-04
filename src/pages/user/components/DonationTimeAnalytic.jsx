import React from 'react';
import { Stack, Box, Typography, CircularProgress } from '@mui/material';
import { formatNumber } from 'utils';

const DonationTimeAnalytic = ({ title, total, color, percent }) => {
  return (
    <Stack direction="row" alignItems="center" justifyContent="center" sx={{ width: 1, minWidth: 200 }}>
      <Stack alignItems="center" justifyContent="center" sx={{ position: 'relative' }}>
        <CircularProgress variant="determinate" value={percent} size={56} thickness={4} sx={{ color, opacity: 0.9 }} />

        <CircularProgress
          variant="determinate"
          value={100}
          size={56}
          thickness={4}
          sx={{ color: 'grey.300', position: 'absolute', top: 0, left: 0, opacity: 0.48 }}
        />
      </Stack>

      <Stack spacing={0.5} sx={{ ml: 2 }}>
        <Typography variant="h6">{title}</Typography>

        <Typography variant="subtitle2">
          {formatNumber(total)}{' '}
          <Box component="span" sx={{ color: 'text.secondary', typography: 'body2' }}>
            người
          </Box>
        </Typography>

        <Typography variant="subtitle2" sx={{ color }}>
          {percent?.toFixed(2)}%
        </Typography>
      </Stack>
    </Stack>
  );
};

export default DonationTimeAnalytic;
