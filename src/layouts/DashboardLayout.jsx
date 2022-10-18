import React from 'react';
import { Box, styled } from '@mui/material';
import { Sidebar } from './components/Sidebar';
import Navbar from './components/Navbar';
import { Outlet } from 'react-router-dom';

const MainContainer = styled('div')(({ theme }) => ({
  width: '100%',
  height: '100vh',
  color: theme.palette.grey[900],
  background: theme.palette.background.grey,
  display: 'flex',
  overflowX: 'scroll',

  '& .box-content': { width: '100%' },
}));

export const DashboardLayout = () => {
  return (
    <MainContainer>
      <Sidebar />
      <Box className="box-content" sx={{ flex: 1, pb: 8 }}>
        <Navbar />
        <Box sx={{ height: 1, px: 5, pt: 6, pb: 18 }}>
          <Outlet />
        </Box>
      </Box>
    </MainContainer>
  );
};
