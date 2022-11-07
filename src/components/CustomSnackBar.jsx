import React, { forwardRef, useState } from 'react';
import { Snackbar } from '@mui/material';
import MuiAlert from '@mui/material/Alert';

const Alert = forwardRef(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

export const CustomSnackBar = (props) => {
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
        sx={{ marginTop: '60px', backgroundColor: '#2BC155', color: 'white', borderRadius: '10px' }}
        open={isOpen}
        autoHideDuration={5000}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        onClose={handleClose}
        key={'top' + 'right'}
      >
        <Alert
          onClose={handleClose}
          severity={props.type}
          sx={{ width: '100%', color: 'white', alignItems: 'center', height: '50px', borderRadius: '10px' }}
        >
          {props.message}
        </Alert>
      </Snackbar>
    </>
  );
};
