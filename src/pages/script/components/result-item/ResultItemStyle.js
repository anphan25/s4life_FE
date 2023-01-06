import { Stack, styled } from '@mui/material';

export const ResultItemContainer = styled(Stack)(({ theme }) => ({
  flexDirection: 'column',
  gap: '8px',
  padding: '16px',
  borderBottom: `1px dashed ${theme.palette.grey[400]}`,
  cursor: 'pointer',
}));

export const Tag = styled(Stack)(({ theme }) => ({
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: 10,
  fontWeight: 700,
  textTransform: 'uppercase',
  borderRadius: '0.475rem',
  padding: '6px 10px',
}));
