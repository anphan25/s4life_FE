import { DialogActions, Stack, styled } from '@mui/material';

export const HeaderMainStyle = styled(Stack)(({ theme }) => ({
  marginBottom: '20px',
  justifyContent: 'space-between',

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

export const InputFilterSectionStyle = styled(Stack)(({ theme }) => ({
  flexDirection: 'row',
  margin: '20px',
  gap: 10,

  [theme.breakpoints.down('md')]: {
    flexDirection: 'column',
  },
}));

export const DialogButtonGroup = styled(DialogActions)(({ theme }) => ({
  marginTop: 'auto',
  padding: '10px 0px 10px !important',

  [theme.breakpoints.down('sm')]: {
    margin: '0 auto',
    '& .dialog_button': {
      fontSize: '10px',
    },
  },
}));
