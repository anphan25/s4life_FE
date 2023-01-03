import { styled, Stack } from '@mui/material';

export const HeaderMainStyle = styled(Stack)(({ theme }) => ({
  marginBottom: '20px',
  justifyContent: 'space-between',
  width: '100%',
  flexDirection: 'row',

  [theme.breakpoints.up('sm')]: {
    alignItems: 'center',
  },

  [theme.breakpoints.down('sm')]: {
    flexDirection: 'column',
    justifyContent: 'start',
    gap: '20px',
  },
}));

export const RunContainer = styled(Stack)(({ theme }) => ({
  backgroundColor: theme.palette.grey[900],
  height: '650px',
  borderRadius: '20px',
  color: 'white',
  padding: '24px',

  p: {
    fontSize: 12,
  },
}));

export const ResultContainer = styled(Stack)(({ theme }) => ({
  backgroundColor: 'white',
  color: theme.palette.grey[900],
  height: '650px',
  borderRadius: '20px',
}));
