import { alpha } from '@mui/material';

export const palette = {
  primary: {
    light: alpha('#C13538', 0.08),
    main: '#C13538',
  },
  info: {
    light: alpha('#0068FF', 0.08),
    main: '#0068FF',
  },
  warning: {
    light: alpha('#FFC700', 0.08),
    main: '#FFC700',
  },
  error: {
    light: alpha('#FC5A5A', 0.08),
    main: '#FC5A5A',
  },
  success: {
    light: alpha('#2BC155', 0.08),
    main: '#2BC155',
  },
  grey: {
    50: '#FAFAFA',
    100: '#F5F5F5',
    200: '#EEEEEE',
    300: '#E0E0E0',
    400: '#BDBDBD',
    500: '#9E9E9E',
    600: '#757575',
    700: '#616161',
    800: '#424242',
    900: '#212121',
  },
  background: { grey: '#F1F1F5', white: '#FFFFFF' },
};
