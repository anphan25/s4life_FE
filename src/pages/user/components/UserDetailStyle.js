import { textAlign } from '@mui/system';

const { styled, Stack, Paper, Typography } = require('@mui/material');

export const Item = styled(Paper)(({ theme }) => ({
  backgroundColor: 'white',
  borderRadius: '.475rem',
  padding: theme.spacing(3.5),
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
  '&:hover': { opacity: 0 },
}));
export const HospitalImgStyle = styled('div')(({ theme }) => ({
  width: '160px',
  height: '160px',
  borderRadius: '100%',
  padding: '5px',
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
  padding: '10px 10px',
  borderRadius: '0.475rem',
  marginRight: '10px',
  marginBottom: '10px',
}));

export const LeftContainer = styled(Stack)(({ theme }) => ({
  flexDirection: 'row',
  alignItems: 'center',
  gap: '16px',
}));

export const TitleTypoStyle = styled(Typography)(({ theme }) => ({
  textAlign: 'left',
  fontSize: '14px',
  fontWeight: 500,
  color: theme.palette.grey[500],
}));

export const ContentTypoStyle = styled(Typography)(({ theme }) => ({
  textAlign: 'left',
  fontSize: '16px',
  fontWeight: 600,
}));
