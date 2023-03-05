import React, { useState } from 'react';
import { Snackbar, Alert } from '@mui/material';

export const CustomSnackBar = ({ message, type, sx }) => {
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
          boxShadow: 'rgba(149, 157, 165, 0.2) 0px 8px 24px',
          backgroundColor: 'grey.100',
          ...sx,
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
        <Alert onClose={handleClose} severity={type} sx={{ width: '100%' }}>
          {message}
        </Alert>
      </Snackbar>
    </>
  );
};
