import { Popover } from '@mui/material';
import React from 'react';

export const Dropdown = ({ children, sx, ...props }) => {
  return (
    <Popover
      anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      PaperProps={{
        sx: {
          p: 1,
          width: 200,
          overflow: 'inherit',
          ...sx,
        },
      }}
      {...props}
    >
      {children}
    </Popover>
  );
};
