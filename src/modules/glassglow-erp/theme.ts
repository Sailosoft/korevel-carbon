import type { CSSObject, SxProps, Theme, ThemeOptions } from "@mui/material/styles";
import type {} from "@mui/x-data-grid/themeAugmentation";

const GLASS_SURFACE: CSSObject = {
  backgroundColor: "rgba(255, 255, 255, 0.72)",
  backgroundImage:
    "linear-gradient(155deg, rgba(255, 255, 255, 0.94), rgba(255, 255, 255, 0.58))",
  border: "1px solid rgba(79, 70, 229, 0.14)",
  backdropFilter: "blur(14px)",
  WebkitBackdropFilter: "blur(14px)",
  boxShadow: "0 24px 48px -34px rgba(30, 27, 75, 0.55)",
};

/** Shared translucent surface for panels and stat cards. */
export const GLASS_PANEL_SX: SxProps<Theme> = {
  ...GLASS_SURFACE,
  borderRadius: "16px",
};

/** Translucent surface for the sidebar drawer paper. */
export const GLASS_SIDEBAR_SX: CSSObject = {
  backgroundColor: "rgba(255, 255, 255, 0.72)",
  backgroundImage:
    "linear-gradient(155deg, rgba(255, 255, 255, 0.94), rgba(255, 255, 255, 0.58))",
  backdropFilter: "blur(14px)",
  WebkitBackdropFilter: "blur(14px)",
  borderRight: "1px solid rgba(79, 70, 229, 0.14)",
  boxShadow: "0 24px 48px -34px rgba(30, 27, 75, 0.55)",
};

export const glassglowThemeOptions: ThemeOptions = {
  palette: {
    mode: "light",
    primary: { main: "#4f46e5", light: "#818cf8", dark: "#3730a3" },
    secondary: { main: "#0891b2", light: "#22d3ee", dark: "#0e7490" },
    background: { default: "#eef1fb", paper: "#ffffff" },
    text: { primary: "#1e1b4b", secondary: "#5b6280" },
    divider: "rgba(79, 70, 229, 0.14)",
  },
  shape: { borderRadius: 16 },
  typography: {
    fontFamily: "var(--font-geist-sans), Arial, Helvetica, sans-serif",
    h4: { fontWeight: 700, letterSpacing: "-0.02em" },
    h5: { fontWeight: 700 },
    h6: { fontWeight: 700 },
    button: { textTransform: "none", fontWeight: 600 },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: { borderRadius: 10 },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: "rgba(255, 255, 255, 0.72)",
          backgroundImage:
            "linear-gradient(120deg, rgba(255, 255, 255, 0.9), rgba(238, 241, 251, 0.68))",
          color: "#1e1b4b",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          borderBottom: "1px solid rgba(79, 70, 229, 0.14)",
          boxShadow: "none",
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: { ...GLASS_SURFACE },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          backgroundColor: "rgba(255, 255, 255, 0.96)",
          backdropFilter: "blur(18px)",
          WebkitBackdropFilter: "blur(18px)",
        },
      },
    },
    MuiDataGrid: {
      styleOverrides: {
        root: {
          border: "1px solid rgba(79, 70, 229, 0.12)",
          borderRadius: 16,
          backgroundColor: "rgba(255, 255, 255, 0.55)",
        },
        columnHeaders: {
          backgroundColor: "rgba(79, 70, 229, 0.06)",
        },
        columnHeaderTitle: {
          fontWeight: 700,
        },
        cell: {
          borderColor: "rgba(79, 70, 229, 0.08)",
        },
        footerContainer: {
          borderTop: "1px solid rgba(79, 70, 229, 0.12)",
        },
      },
    },
  },
};
