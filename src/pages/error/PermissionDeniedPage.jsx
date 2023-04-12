import React from 'react';
import { Box, styled } from '@mui/material';
import { PermissionDenied as imgPermissionDenied } from 'assets';
import { Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const MainContainer = styled('div')(({ theme }) => ({
  width: '100%',
  height: '100vh',
  color: theme.palette.grey[900],
  background: theme.palette.background.grey,
  justifyContent: 'center',
  alignItems: 'center',
  display: 'flex',
  overflow: 'hidden',
}));
const DivContent = styled('div')(({ theme }) => ({
  width: '1180px',
  height: '651px',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  borderRadius: '16px',

  [theme.breakpoints.down('lg')]: {
    justifyContent: 'center',
    display: 'flex',
  },
  [theme.breakpoints.between('sm', 'md')]: {
    justifyContent: 'center',
    width: '700px',
    height: '551px',
  },

  [theme.breakpoints.between('xs', 'sm')]: {
    flexDirection: 'column',
    margin: '0 auto !important',
    width: '100%',
    justifyContent: 'center',
    height: '819px',
    '& img': {
      height: '50%',
    },
  },
}));

const PermissionDeniedPage = () => {
  const navigate = useNavigate();
  return (
    <MainContainer>
      <DivContent>
        <img src={imgPermissionDenied} alt="" width="100%" height="100%" />
        <Button
          onClick={() => {
            navigate('/');
          }}
          variant="contained"
          sx={{
            position: 'absolute',
            marginTop: 15,
          }}
        >
          VỀ TRANG CHỦ
        </Button>
      </DivContent>
    </MainContainer>
  );
};

export default PermissionDeniedPage;
