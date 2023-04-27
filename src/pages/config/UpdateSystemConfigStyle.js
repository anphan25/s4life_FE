import { Box, styled } from '@mui/material';

export const LeftSideStyle = styled(Box)(({ theme }) => ({
  padding: '12px 0',
  width: '25%',
  height: 'auto',
  backgroundColor: '#FFFF !important',
  borderRight: `1px solid ${theme.palette.grey[300]}`,
}));

export const RightSideStyle = styled(Box)(({ theme }) => ({
  width: '75%',
  height: '100%',
  padding: '24px',
}));
