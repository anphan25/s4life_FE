import React, { useState } from 'react';
import { Snackbar, Box, Stack, Typography } from '@mui/material';
import { Icon } from 'components';

export const MultipleAlertSnackBar = ({ sx, numberOfSuccess, numberOfFailure, onClick, isOpen, onClose }) => {
  const handleClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }

    onClose();
  };

  return (
    <>
      <Snackbar
        sx={{
          marginTop: '60px',
          borderRadius: '12px',
          boxShadow: 'rgba(149, 157, 165, 0.2) 0px 8px 24px',
          backgroundColor: 'grey.100',
          cursor: 'pointer',
          transition: '0.3',

          '&:hover': { backgroundColor: 'grey.200' },
          ...sx,
        }}
        open={isOpen}
        autoHideDuration={7000}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        onClose={handleClose}
        key={`topright`}
        onClick={() => {
          onClick();
          handleClose();
        }}
      >
        <Box sx={{ width: '100%', padding: '15px' }}>
          <Stack direction="row" alignItems="center" gap={1} mb="10px">
            <Icon icon="solid-check-circle" sx={{ color: 'success.main' }} />
            <Typography fontWeight={500}>Thành công ({numberOfSuccess})</Typography>
          </Stack>
          <Stack direction="row" alignItems="center" gap={1}>
            <Icon icon="solid-times-circle" sx={{ color: 'error.main' }} />
            <Typography fontWeight={500}>Thất bại ({numberOfFailure})</Typography>
          </Stack>

          <Typography sx={{ fontSize: '11px', marginTop: '10px', marginLeft: '5px' }}>Nhấn để xem chi tiết</Typography>
        </Box>
      </Snackbar>
    </>
  );
};
