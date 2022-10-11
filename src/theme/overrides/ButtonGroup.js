export default function ButtonGroup(theme) {
  const styleContained = (color) => ({
    props: { variant: "contained", color },
    style: { boxShadow: "none" },
  });

  return {
    MuiButtonGroup: {
      variants: [
        {
          props: { variant: "contained", color: "inherit" },
          style: { boxShadow: "none" },
        },
        styleContained("primary"),
        styleContained("secondary"),
        styleContained("info"),
        styleContained("success"),
        styleContained("warning"),
        styleContained("error"),

        {
          props: { disabled: true },
          style: {
            boxShadow: "none",
            "& .MuiButtonGroup-grouped.Mui-disabled": {
              color: theme.palette.grey[900],
              borderColor: `${theme.palette.grey[300]} !important`,
              "&.MuiButton-contained": {
                backgroundColor: theme.palette.grey[200],
              },
            },
          },
        },
      ],

      styleOverrides: {
        root: {
          "&:hover": {
            boxShadow: "none",
          },
        },
      },
    },
  };
}
