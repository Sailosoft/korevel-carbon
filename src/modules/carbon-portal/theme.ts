import type { ThemeOptions } from "@mui/material/styles";
import type { Scope } from "./db/types";

export const SCOPE_COLORS: Record<Scope, string> = {
  1: "#ef6c00",
  2: "#0288d1",
  3: "#2e7d32",
};

export const carbonPortalThemeOptions: ThemeOptions = {
  palette: {
    mode: "light",
    primary: { main: "#2e7d32" },
    secondary: { main: "#37474f" },
  },
  shape: { borderRadius: 12 },
  typography: {
    fontFamily: "var(--font-geist-sans), Arial, Helvetica, sans-serif",
  },
};
