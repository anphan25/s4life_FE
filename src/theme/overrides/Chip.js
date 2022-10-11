import { CloseIcon } from "./CustomIcons";

export default function Chip(theme) {
  return {
    MuiChip: {
      defaultProps: {
        deleteIcon: <CloseIcon />,
      },

      styleOverrides: {
        outlined: {
          borderColor: theme.palette.grey[300],
          "&.MuiChip-colorPrimary": {
            borderColor: theme.palette.primary.main,
          },
          "&.MuiChip-colorSecondary": {
            borderColor: theme.palette.secondary.main,
          },
        },
        avatarColorSuccess: {
          color: "#fff",
          backgroundColor: theme.palette.success.main,
        },
        avatarColorWarning: {
          color: "#fff",
          backgroundColor: theme.palette.warning.main,
        },
        avatarColorError: {
          color: "#fff",
          backgroundColor: theme.palette.error.main,
        },
      },
    },
  };
}
