import { alpha } from '@mui/material';

// Event Registration Status
export const status = {
  cancelled: {
    light: alpha('#C13538', 0.08),
    main: '#C13538',
  },
  registered: {
    light: alpha('#00AFAF', 0.08),
    main: '#00AFAF',
  },
  donated: {
    light: alpha('#2BC155', 0.08),
    main: '#2BC155',
  },
  conditionInsufficient: {
    light: alpha('#FFC700', 0.08),
    main: '#FFC700',
  },
  present: {
    light: alpha('#0068FF', 0.08),
    main: '#0068FF',
  },

  discarded: {
    light: alpha('#FC5A5A', 0.08),
    main: '#FC5A5A',
  },

  missed: { light: alpha('#584CF4', 0.08), main: '#584CF4' },
};
