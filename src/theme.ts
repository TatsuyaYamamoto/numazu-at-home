import { createMuiTheme } from "@material-ui/core/styles";
import { red, blue } from "@material-ui/core/colors";

// Create a theme instance.
const theme = createMuiTheme({
  palette: {
    primary: {
      main: blue[700],
    },
    secondary: {
      main: "#19857b",
    },
    error: {
      main: red.A400,
    },
    background: {
      default: "#fff",
    },
  },
  overrides: {
    MuiButton: {
      label: {
        textTransform: "none",
      },
    },
  },
});

export default theme;
