import { CssBaseline } from '@mui/material';
import Router from 'router/Router';
import { Theme } from 'theme';
import '@goongmaps/goong-js/dist/goong-js.css';

import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import 'moment/locale/vi';

function App() {
  return (
    <Theme>
      <LocalizationProvider dateAdapter={AdapterMoment} adapterLocale={'vi'}>
        <CssBaseline />
        <Router />
      </LocalizationProvider>
    </Theme>
  );
}

export default App;
