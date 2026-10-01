import type { Metadata } from "next";
import type { ReactNode } from "react";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import { AppThemeProvider } from "@/shared/components/AppThemeProvider";
import {
  CarbonPortalBootstrap,
  CarbonPortalNav,
  carbonPortalThemeOptions,
} from "@/modules/carbon-portal";

export const metadata: Metadata = {
  title: "Carbon Portal",
};

export default function CarbonPortalLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <AppThemeProvider themeOptions={carbonPortalThemeOptions}>
      <CarbonPortalBootstrap>
        <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
          <CarbonPortalNav />
          <Container component="main" maxWidth="lg" sx={{ py: 4 }}>
            {children}
          </Container>
        </Box>
      </CarbonPortalBootstrap>
    </AppThemeProvider>
  );
}
