export default function InputLabel(theme) {
  return {
    MuiInputLabel: {
      styleOverrides: {
        root: {
          cursor: "pointer",
          mb: 1,
          transform: "none",
          position: "relative",
          fontSize: 14,
          fontWeight: 600,
          color: theme.pallete.grey[900],
        },
      },
    },
  };
}
