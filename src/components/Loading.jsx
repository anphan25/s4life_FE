import { styled, Typography } from '@mui/material';
import React from 'react';
import { Logo } from 'components';

const LoadingContainer = styled('div')(({ theme }) => ({
  right: 0,
  bottom: 0,
  zIndex: 99999,
  width: '100%',
  height: '100%',
  position: 'fixed',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexDirection: 'column',
}));

export const Loading = () => {
  return (
    <LoadingContainer>
      <Logo />
      <Typography fontWeight={600}>Đang tải ...</Typography>
    </LoadingContainer>
  );
};
