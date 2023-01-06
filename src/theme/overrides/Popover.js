import { alpha } from '@mui/material';

export default function Popover(theme) {
  return {
    MuiPopover: {
      styleOverrides: {
        paper: {
          padding: '16px',
          boxShadow: `0px 40px 64px -12px ${alpha(theme.palette.grey[900], 0.08)}, 0px 0px 14px -4px ${alpha(
            theme.palette.grey[900],
            0.05
          )}, 0px 32px 48px -8px ${alpha(theme.palette.grey[900], 0.01)} !important`,
          borderRadius: 12,
        },
      },
    },
  };
}
