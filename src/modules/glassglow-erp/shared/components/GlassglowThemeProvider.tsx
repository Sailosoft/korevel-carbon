"use client";

import { useMemo, type ReactNode } from "react";
import CssBaseline from "@mui/material/CssBaseline";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { glassglowThemeOptions } from "../../theme";

export function GlassglowThemeProvider({ children }: { children: ReactNode }) {
  const theme = useMemo(() => createTheme(glassglowThemeOptions), []);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
}
