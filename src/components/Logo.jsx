import { Box, Avatar } from '@mui/material';
import { Logo as LogoImg } from 'assets';
import React from 'react';

export const Logo = ({ sx }) => {
  return (
    <Box sx={{ width: 120, height: 120, marginBottom: '30px', ...sx }}>
      <Avatar sx={{ width: '100%', height: '100%' }} src={LogoImg} />
    </Box>
  );
};
