export default function Card(theme) {
  return {
    MuiCard: {
      styleOverrides: {
        root: {
          position: "relative",
          boxShadow: "none",
          borderRadius: 16,
          zIndex: 0,
        },
      },
    },
    MuiCardHeader: {
      defaultProps: {
        titleTypographyProps: { variant: "h6" },
        subheaderTypographyProps: {
          variant: "body2",
          marginTop: theme.spacing(0.5),
        },
      },
      styleOverrides: {
        root: {
          padding: theme.spacing(2),
        },
      },
    },
    MuiCardContent: {
      styleOverrides: {
        root: {
          padding: theme.spacing(2),
        },
      },
    },
  };
}
