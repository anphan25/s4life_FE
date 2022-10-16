export default function FormControlLabel(theme) {
  return {
    MuiFormControlLabel: {
      styleOverrides: {
        label: {
          cursor: 'pointer',
          mb: 1,
          //transform: "none",
          // position: "relative",
          fontSize: 14,
          fontWeight: 600,
        },
      },
    },
    MuiFormHelperText: {
      styleOverrides: {
        root: {
          marginTop: theme.spacing(1),
        },
      },
    },
    MuiFormLabel: {
      styleOverrides: {
        root: {
          color: theme.palette.grey[900],
        },
      },
    },
  };
}
