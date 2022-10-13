import { alpha } from '@mui/material';

export const palette = {
  primary: {
    main: '#C13538',
  },
  info: {
    light: alpha('#0068FF', 0.2),
    main: '#0068FF',
  },
  warning: {
    light: alpha('#FFC700', 0.2),
    main: '#FFC700',
  },
  error: {
    light: alpha('#FC5A5A', 0.2),
    main: '#FC5A5A',
  },
  success: {
    light: alpha('#2BC155', 0.2),
    main: '#2BC155',
  },
  grey: {
    100: '#F5F8FA',
    200: '#F4F4F4',
    300: '#E4E6EF',
    400: '#B5B5C3',
    500: '#A1A5B7',
    600: '#7E8299',
    700: '#5E6278',
    800: '#3F4254',
    900: '#181C32',
  },
  background: '#F4F4F4',
};
