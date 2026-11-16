import { RouterProvider } from "react-router-dom";
import { createTheme, CssBaseline, ThemeProvider } from "@mui/material";
import router from "./router.jsx";

const temaNavidad = createTheme({
  palette: {
    mode: "light",
    primary: { main: "#b71c1c", dark: "#8e0000", light: "#e53935" },
    secondary: { main: "#a67c00", light: "#d4af37" },
    background: { default: "#fffaf3", paper: "#ffffff" },
    text: { primary: "#2b2b2b", secondary: "#5f5f5f" }
  },
  shape: { borderRadius: 14 },
  typography: {
    fontFamily: '"Segoe UI", system-ui, sans-serif',
    h3: { fontWeight: 700 },
    h4: { fontWeight: 700 },
    h5: { fontWeight: 600 },
    button: { textTransform: "none", fontWeight: 600 }
  }
});

function App() {
  return (
    <ThemeProvider theme={temaNavidad}>
      <CssBaseline />
      <RouterProvider router={router} />
    </ThemeProvider>
  );
}

export default App;
