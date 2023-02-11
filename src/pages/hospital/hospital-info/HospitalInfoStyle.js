const { styled, Stack, Paper } = require('@mui/material');

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

export const LeftContainer = styled(Stack)(({ theme }) => ({
  flexDirection: 'column',
  gap: '16px',
}));
