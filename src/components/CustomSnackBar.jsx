import React, { useState } from 'react';
import { alpha, Snackbar, Alert, useTheme } from '@mui/material';

export const CustomSnackBar = (props) => {
  const theme = useTheme();
  const [isOpen, setIsOpen] = useState(true);

  const handleClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }

    setIsOpen(false);
  };

  return (
    <>
      <Snackbar
        sx={{
          marginTop: '60px',
          borderRadius: '12px',
          boxShadow: `0 8px 16px 0 ${alpha(theme.palette.grey[300], 0.08)}`,
          backgroundColor: 'grey.100',
        }}
        open={isOpen}
        autoHideDuration={5000}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        onClose={handleClose}
        key={`topright`}
      >
        <Alert onClose={handleClose} severity={props.type} sx={{ width: '100%' }}>
          {props.message}
        </Alert>
      </Snackbar>
    </>
  );
};
