import type { Metadata } from "next";
import type { ReactNode } from "react";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import { catalogThemeOptions } from "@/modules/catalog";
import { AppThemeProvider } from "@/shared/components/AppThemeProvider";

export const metadata: Metadata = {
  title: "Catalog",
};

export default function CatalogLayout({ children }: { children: ReactNode }) {
  return (
    <AppThemeProvider themeOptions={catalogThemeOptions}>
      <AppBar
        position="static"
        color="transparent"
        elevation={0}
        sx={{
          borderBottom: "1px solid",
          borderColor: "divider",
          bgcolor: "rgba(5, 8, 7, 0.6)",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
        }}
      >
        <Toolbar sx={{ gap: 1.5, minHeight: { xs: 64, sm: 72 } }}>
          <Box
            sx={{
              width: 34,
              height: 34,
              display: "grid",
              placeItems: "center",
              borderRadius: 2.5,
              background: "linear-gradient(135deg, #34e0a1, #38bdf8)",
              boxShadow: "0 10px 24px -12px rgba(52, 224, 161, 0.8)",
              color: "#04110e",
              fontFamily: "var(--font-geist-mono), monospace",
              fontWeight: 800,
              fontSize: 16,
            }}
          >
            K
          </Box>
          <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
            Korevel
            <Box
              component="span"
              sx={{ color: "text.secondary", fontWeight: 400, ml: 0.75 }}
            >
              Carbon
            </Box>
          </Typography>
          <Box sx={{ flexGrow: 1 }} />
          <Typography
            component="span"
            sx={{
              px: 1.5,
              py: 0.5,
              borderRadius: 999,
              border: "1px solid",
              borderColor: "divider",
              fontFamily: "var(--font-geist-mono), monospace",
              fontSize: 11.5,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: "text.secondary",
            }}
          >
            catalog
          </Typography>
        </Toolbar>
      </AppBar>
      {children}
    </AppThemeProvider>
  );
}
