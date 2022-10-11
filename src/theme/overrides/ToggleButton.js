import { alpha } from "@mui/material";

export default function ToggleButton(theme) {
  const style = (color) => ({
    props: { color },
    style: {
      "&:hover": {
        borderColor: alpha(theme.palette[color].main, 0.48),
        backgroundColor: alpha(theme.palette[color].main, 0.2),
      },
      "&.Mui-selected": {
        borderColor: alpha(theme.palette[color].main, 0.48),
      },
    },
  });

  return {
    MuiToggleButton: {
      variants: [
        {
          props: { color: "standard" },
          style: {
            "&.Mui-selected": {
              backgroundColor: theme.palette.action.selected,
            },
          },
        },
        style("primary"),
        style("secondary"),
        style("info"),
        style("success"),
        style("warning"),
        style("error"),
      ],
    },
    MuiToggleButtonGroup: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          backgroundColor: theme.palette.background,
          border: `solid 1px ${theme.palette.grey[400]}`,
          "& .MuiToggleButton-root": {
            margin: 4,
            borderColor: "transparent !important",
            borderRadius: "16px !important",
          },
        },
      },
    },
  };
}
