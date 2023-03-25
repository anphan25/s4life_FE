import { alpha } from '@mui/material';

export default function Popper(theme) {
  return {
    MuiPopper: {
      styleOverrides: {
        root: {
          // boxShadow: `0px 0px 14px -4px ${alpha(theme.palette.grey[900], 0.05)}, 0px 32px 48px -8px ${alpha(
          //   theme.palette.grey[900],
          //   0.1
          // )} !important`,
          borderRadius: 12,
        },
      },
    },
  };
}
