import { alpha } from '@mui/material';
import { ErrorIcon, InfoIcon, SuccessIcon, WarningIcon } from './CustomIcons';

export default function Alert(theme) {
  const standardStyle = (color) => ({
    paddingLeft: '16px',
    paddingRight: '16px',
    color: theme.palette.grey[900],
    backgroundColor: 'white',

    '& .MuiAlert-icon': {
      marginRight: 24,
      width: 40,
      height: 40,
      display: 'flex',
      borderRadius: 24,
      alignItems: 'center',
      justifyContent: 'center',
      color: theme.palette[color]['main'],
      backgroundColor: alpha(theme.palette[color]['main'], 0.16),
    },
  });

  const outlinedStyle = (color) => ({
    color: theme.palette.grey[900],
    border: `solid 1px ${theme.palette[color]['main']}`,
    backgroundColor: 'white',
    '& .MuiAlert-icon': {
      marginRight: 24,
      width: 40,
      height: 40,
      display: 'flex',
      borderRadius: 24,
      alignItems: 'center',
      justifyContent: 'center',
      color: theme.palette[color]['main'],
      backgroundColor: alpha(theme.palette[color]['main'], 0.16),
    },
  });

  return {
    MuiAlert: {
      defaultProps: {
        iconMapping: {
          info: <InfoIcon />,
          success: <SuccessIcon />,
          warning: <WarningIcon />,
          error: <ErrorIcon />,
        },
      },

      styleOverrides: {
        root: {
          borderRadius: 12,
          padding: theme.spacing(1),
        },
        message: {
          fontWeight: 500,
          '& .MuiAlertTitle-root': {
            marginBottom: theme.spacing(0.5),
          },
        },
        action: {
          '& button:not(:first-of-type)': {
            marginLeft: theme.spacing(1),
          },
        },

        standardInfo: standardStyle('info'),
        standardSuccess: standardStyle('success'),
        standardWarning: standardStyle('warning'),
        standardError: standardStyle('error'),

        outlinedInfo: outlinedStyle('info'),
        outlinedSuccess: outlinedStyle('success'),
        outlinedWarning: outlinedStyle('warning'),
        outlinedError: outlinedStyle('error'),
      },
    },
  };
}
