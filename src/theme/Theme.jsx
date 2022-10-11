import { createTheme, ThemeProvider } from "@mui/material";
import { palette, breakpoints, typography, Overrides } from "theme";

export const Theme = ({ children }) => {
  const theme = createTheme({
    palette,
    breakpoints,
    typography,
  });

  theme.components = Overrides(theme);

  return <ThemeProvider theme={theme}>{children}</ThemeProvider>;
};
