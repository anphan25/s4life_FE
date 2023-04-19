import { Stack, styled } from '@mui/material';

export const ResultItemContainer = styled(Stack)(({ theme }) => ({
  justifyContent: 'space-between',
  flexDirection: 'column',
  flexWrap: 'wrap',
  gap: '8px',
  padding: '16px',
  borderBottom: `1px dashed ${theme.palette.grey[400]}`,
  cursor: 'pointer',
}));

export const Tag = styled(Stack)(() => ({
  minHeight: '25px',
  alignItems: 'center',
  justifyContent: 'center',
  flexWrap: 'wrap',
  fontSize: 10,
  lineHeight: 0,
  fontWeight: 700,
  textTransform: 'uppercase',
  borderRadius: '0.475rem',
  padding: '6px 10px',
}));
