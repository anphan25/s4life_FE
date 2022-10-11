import { CssBaseline } from "@mui/material";
import Router from "router/Router";
import { Theme } from "theme";

function App() {
  return (
    <Theme>
      <CssBaseline />
      <Router />
    </Theme>
  );
}

export default App;
