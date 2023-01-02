const { styled, Stack, Paper, DialogActions } = require('@mui/material');

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

export const Item = styled(Paper)(({ theme }) => ({
  backgroundColor: 'white',
  borderRadius: '.475rem',
  padding: theme.spacing(3.5),
  textAlign: 'center',
}));

export const HospitalImgStyle = styled('div')(({ theme }) => ({
  width: '160px',
  height: '160px',
  borderRadius: '100%',
  padding: '10px',
  marginRight: '1.5rem',
  border: `1px dashed ${theme.palette.grey[400]}`,
  position: 'relative',
  display: 'flex',
  flexShrink: 0,
  cursor: 'pointer',
  overflow: 'hidden',
  alignItems: 'center',
  justifyContent: 'center',

  '& img': {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    borderRadius: '100%',
  },
}));

export const DashedBox = styled('div')(({ theme }) => ({
  minWidth: '143px',
  padding: '10px 14px',
  borderRadius: '0.475rem',
  marginRight: '20px',
  marginBottom: '10px',

  border: `1px dashed ${theme.palette.grey[400]}`,
}));

export const PlaceholderStyle = styled('div')(({ theme }) => ({
  opacity: 0,
  width: 'calc(100% - 17px)',
  height: 'calc(100% - 17px)',
  borderRadius: '100%',
  color: theme.palette.grey[100],
  fontSize: '40px',
  display: 'flex',
  position: 'absolute',
  alignItems: 'center',
  flexDirection: 'column',
  justifyContent: 'center',
  zIndex: 999,
  backgroundColor: theme.palette.grey[900],
  transition: theme.transitions.create('opacity', {
    easing: theme.transitions.easing.easeInOut,
    duration: theme.transitions.duration.shorter,
  }),
  '&:hover': { opacity: 0.72 },
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

export const LeftContainer = styled(Stack)(({ theme }) => ({
  flexDirection: 'column',
  gap: '16px',
}));
