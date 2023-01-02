import { Dialog, DialogTitle, Divider, Stack, styled, Box } from '@mui/material';
import React from 'react';

import Slide from '@mui/material/Slide';
import { Icon } from './Icon';

const DialogContentStyle = styled(Box)(({ theme }) => ({
  padding: '10px 20px 20px',
}));

const TitleHeaderStyle = styled(Box)(({ theme }) => ({
  fontSize: '1.25rem',
  fontWeight: 600,
  lineHeight: 1.2,
  [theme.breakpoints.down('sm')]: {
    fontSize: '15px',
  },
}));

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

export const CustomDialog = ({ onClose, children, title, sx, isOpen, ...other }) => {
  return (
    <Dialog TransitionComponent={Transition} sx={sx} {...other} open={isOpen} onClose={onClose}>
      <DialogTitle>
        <Stack direction="row" justifyContent="space-between" alignItems={'center'} gap={6}>
          <TitleHeaderStyle>{title}</TitleHeaderStyle>

          <Icon
            icon="times"
            onClick={onClose}
            sx={{
              color: 'grey.400',
              cursor: 'pointer',
              ':hover': {
                color: 'error.main',
              },
            }}
          />
        </Stack>
      </DialogTitle>
      <Divider sx={{ marginBottom: '10px' }} />

      <DialogContentStyle>{children}</DialogContentStyle>
    </Dialog>
  );
};
