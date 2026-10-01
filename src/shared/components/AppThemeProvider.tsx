"use client";

import { useMemo, type ReactNode } from "react";
import CssBaseline from "@mui/material/CssBaseline";
import {
  createTheme,
  ThemeProvider,
  type ThemeOptions,
} from "@mui/material/styles";

export const baseThemeOptions: ThemeOptions = {
  palette: {
    mode: "light",
    primary: { main: "#00695c" },
    secondary: { main: "#37474f" },
  },
  shape: { borderRadius: 12 },
  typography: {
    fontFamily: "var(--font-geist-sans), Arial, Helvetica, sans-serif",
  },
};

type AppThemeProviderProps = {
  children: ReactNode;
  themeOptions?: ThemeOptions;
};

export function AppThemeProvider({
  children,
  themeOptions,
}: AppThemeProviderProps) {
  const theme = useMemo(
    () =>
      themeOptions
        ? createTheme(baseThemeOptions, themeOptions)
        : createTheme(baseThemeOptions),
    [themeOptions],
  );

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
}
