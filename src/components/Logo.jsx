import { Box, Avatar } from '@mui/material';
import { Logo as logo } from 'assets';
import React from 'react';

export const Logo = ({ sx }) => {
  return (
    <Box sx={{ width: 143, height: 81, marginBottom: '30px', ...sx }}>
      <Avatar sx={{ width: '120px', height: '120px' }} src={logo} />
    </Box>
  );
};
