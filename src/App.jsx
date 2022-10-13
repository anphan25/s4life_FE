import { CssBaseline } from "@mui/material";
import Router from "router/Router";
import { Theme } from "theme";
import { AdapterMoment } from "@mui/x-date-pickers/AdapterMoment";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";

function App() {
  return (
    <Theme>
      <LocalizationProvider dateAdapter={AdapterMoment}>
        <CssBaseline />
        <Router />
      </LocalizationProvider>
    </Theme>
  );
}

export default App;
