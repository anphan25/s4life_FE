export default function Fab(theme) {
  return {
    MuiFab: {
      defaultProps: {
        color: "primary",
      },

      styleOverrides: {
        root: {
          boxShadow: "none",
          "&:hover": {
            boxShadow: "none",
            backgroundColor: theme.palette.grey[400],
          },
        },
        primary: {
          boxShadow: "none",
          "&:hover": {
            backgroundColor: theme.palette.primary.main,
          },
        },
        extended: {
          "& svg": {
            marginRight: theme.spacing(1),
          },
        },
      },
    },
  };
}
