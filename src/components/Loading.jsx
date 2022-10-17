import { Box, styled } from '@mui/material';
import React from 'react';
import { Logo } from 'assets';

const LoadingContainer = styled(Box)(({ theme }) => ({
  position: 'absolute',
  zIndex: '1000',
  width: ' 100%',
  height: '100%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexDirection: 'column',
  backgroundColor: '#f2f3f8',

  img: {
    marginLeft: 'calc(100vw - 100%)',
    marginBottom: '30px',
  },
}));

export const Loading = () => {
  return (
    <LoadingContainer>
      <img src={Logo} alt="S4Life logo" />
      <span>Loading ...</span>
    </LoadingContainer>
  );
};
