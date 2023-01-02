import React from 'react';
import { Box, styled } from '@mui/material';
import { Sidebar } from './components/Sidebar';
import Navbar from './components/Navbar';
import { Outlet } from 'react-router-dom';
import useToggle from 'hooks/useToggle';

const MainContainer = styled('div')(({ theme }) => ({
  width: '100%',
  height: '100vh',
  color: theme.palette.grey[900],
  background: theme.palette.background.grey,
  display: 'flex',
  overflow: 'hidden',
}));

export const DashboardLayout = () => {
  const { onOpen, toggle, onToggle } = useToggle();

  return (
    <MainContainer>
      <Sidebar toggle={toggle} onClose={onToggle} />
      <Box sx={{ flex: 1, pb: 8, width: '100%' }}>
        <Navbar onOpen={onOpen} />
        <Box sx={{ px: 5, pt: 6, pb: 14, overflow: 'scroll', height: '100%' }}>
          <Outlet />
        </Box>
      </Box>
    </MainContainer>
  );
};
