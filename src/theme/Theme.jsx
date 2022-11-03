import { createTheme, ThemeProvider } from '@mui/material';
import { palette, breakpoints, typography, Overrides } from 'theme';
import { viVN } from '@mui/material/locale';
import { viVN as dataGridViVN } from '@mui/x-data-grid';
import { useMemo } from 'react';

export const Theme = ({ children }) => {
  const theme = createTheme({
    palette,
    breakpoints,
    typography,
  });

  theme.components = Overrides(theme);

  const themeWithLocale = useMemo(() => createTheme(theme, viVN, dataGridViVN), [theme]);

  return <ThemeProvider theme={themeWithLocale}>{children}</ThemeProvider>;
};
