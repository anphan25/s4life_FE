export default function FormControlLabel(theme) {
  return {
    MuiFormHelperText: {
      styleOverrides: {
        root: {
          marginTop: theme.spacing(1),
          fontWeight: 600,
        },
      },
    },
    MuiFormLabel: {
      styleOverrides: {
        root: {
          cursor: 'pointer',
          marginBottom: theme.spacing(1),
          fontSize: 14,
          fontWeight: 600,
          color: theme.palette.grey[900],
        },
      },
    },
  };
}
