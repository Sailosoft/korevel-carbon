import type { ThemeOptions } from "@mui/material/styles";

export const catalogThemeOptions: ThemeOptions = {
  palette: {
    mode: "dark",
    primary: { main: "#2dd4bf" },
    secondary: { main: "#38bdf8" },
    background: { default: "#050807", paper: "#0b1210" },
    text: { primary: "#e9f2ef", secondary: "#93a7a1" },
    divider: "rgba(233, 242, 239, 0.1)",
    success: { main: "#4ade80" },
  },
  shape: { borderRadius: 16 },
  typography: {
    fontFamily: "var(--font-geist-sans), Arial, Helvetica, sans-serif",
    h1: { letterSpacing: "-0.035em" },
    h6: { letterSpacing: "-0.015em" },
    button: { textTransform: "none", fontWeight: 600 },
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: { backgroundImage: "none" },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: { fontWeight: 600 },
        outlined: {
          borderColor: "rgba(233, 242, 239, 0.16)",
          color: "#93a7a1",
        },
      },
    },
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: { borderRadius: 999, fontWeight: 600 },
      },
    },
  },
};
