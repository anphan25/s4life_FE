import { Box, styled, Typography } from '@mui/material';
import React from 'react';
import { Logo } from 'components';

const LoadingContainer = styled(Box)(({ theme }) => ({
  position: 'absolute',
  zIndex: '1000',
  width: ' 100%',
  height: '100%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexDirection: 'column',
  backgroundColor: theme.palette.background,
}));

export const Loading = () => {
  return (
    <LoadingContainer>
      <Logo />
      <Typography fontWeight={600}>Đang tải ...</Typography>
    </LoadingContainer>
  );
};
