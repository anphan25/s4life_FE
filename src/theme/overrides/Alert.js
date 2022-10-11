import { ErrorIcon, InfoIcon, SuccessIcon, WarningIcon } from "./CustomIcons";

export default function Alert(theme) {
  const standardStyle = (color) => ({
    color: theme.palette[color]["main"],
    backgroundColor: theme.palette[color]["light"],
    "& .MuiAlert-icon": {
      color: theme.palette[color]["main"],
    },
  });

  const outlinedStyle = (color) => ({
    color: theme.palette[color]["main"],
    border: `solid 1px ${theme.palette[color]["main"]}`,
    backgroundColor: theme.palette[color]["light"],
    "& .MuiAlert-icon": {
      color: theme.palette[color]["main"],
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
        },
        message: {
          fontWeight: 500,
          "& .MuiAlertTitle-root": {
            marginBottom: theme.spacing(0.5),
          },
        },
        action: {
          "& button:not(:first-of-type)": {
            marginLeft: theme.spacing(1),
          },
        },

        standardInfo: standardStyle("info"),
        standardSuccess: standardStyle("success"),
        standardWarning: standardStyle("warning"),
        standardError: standardStyle("error"),

        outlinedInfo: outlinedStyle("info"),
        outlinedSuccess: outlinedStyle("success"),
        outlinedWarning: outlinedStyle("warning"),
        outlinedError: outlinedStyle("error"),
      },
    },
  };
}
