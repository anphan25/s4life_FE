// ----------------------------------------------------------------------

export default function Avatar(theme) {
  return {
    MuiAvatar: {
      styleOverrides: {},
    },
    MuiAvatarGroup: {
      styleOverrides: {
        avatar: {
          fontSize: 16,
          fontWeight: 500,
          "&:first-of-type": {
            fontSize: 14,
            color: theme.palette.primary.main,
            backgroundColor: theme.palette.primary.light,
          },
        },
      },
    },
  };
}
