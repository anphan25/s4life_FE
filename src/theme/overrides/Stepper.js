export default function Stepper(theme) {
  return {
    MuiStepConnector: {
      styleOverrides: {
        line: {
          borderColor: theme.palette.grey[300],
        },
      },
    },
  };
}
