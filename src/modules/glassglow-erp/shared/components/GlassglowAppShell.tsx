"use client";

import { useEffect, useState, type ReactNode } from "react";
import MenuIcon from "@mui/icons-material/Menu";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Drawer from "@mui/material/Drawer";
import Fab from "@mui/material/Fab";
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import { GLASS_SIDEBAR_SX } from "../../theme";
import { useUiStore } from "../../stores/uiStore";
import { GlassglowSidebarContent } from "./GlassglowSidebarContent";
import { GlassglowSnackbar } from "./GlassglowSnackbar";

const SIDEBAR_WIDTH = 260;
const SIDEBAR_RAIL_WIDTH = 76;

/**
 * Sidebar-only app shell: permanent collapsible drawer on desktop, temporary
 * drawer behind a floating menu button on mobile, and the page content area.
 */
export function GlassglowAppShell({ children }: { children: ReactNode }) {
  const theme = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);
  const collapsed = useUiStore((state) => state.sidebarCollapsed);
  const setSidebarCollapsed = useUiStore((state) => state.setSidebarCollapsed);
  const isDesktop = useMediaQuery(theme.breakpoints.up("md"));

  useEffect(() => {
    void useUiStore.persist.rehydrate();
  }, []);

  useEffect(() => {
    if (!isDesktop || collapsed) return;

    const handleDocumentClick = (event: MouseEvent) => {
      if (event.target instanceof Element && event.target.closest("[data-glassglow-sidebar]")) {
        return;
      }
      setSidebarCollapsed(true);
    };

    document.addEventListener("click", handleDocumentClick);
    return () => document.removeEventListener("click", handleDocumentClick);
  }, [collapsed, isDesktop, setSidebarCollapsed]);

  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      <Drawer
        variant="permanent"
        anchor="left"
        sx={{
          display: { xs: "none", md: "block" },
          flexShrink: 0,
          width: collapsed ? SIDEBAR_RAIL_WIDTH : SIDEBAR_WIDTH,
          transition: theme.transitions.create("width"),
        }}
        slotProps={{
          paper: {
            sx: {
              ...GLASS_SIDEBAR_SX,
              position: "sticky",
              top: 0,
              height: "100vh",
              width: "100%",
              boxSizing: "border-box",
              overflowX: "hidden",
            },
          },
        }}
      >
        <GlassglowSidebarContent collapsed={collapsed} showCollapseToggle />
      </Drawer>

      <Drawer
        variant="temporary"
        anchor="left"
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        ModalProps={{ keepMounted: true }}
        sx={{ display: { md: "none" } }}
        slotProps={{
          paper: {
            sx: {
              ...GLASS_SIDEBAR_SX,
              width: SIDEBAR_WIDTH,
              boxSizing: "border-box",
            },
          },
        }}
      >
        <GlassglowSidebarContent
          collapsed={false}
          showCollapseToggle={false}
          onNavigate={() => setMobileOpen(false)}
        />
      </Drawer>

      <Fab
        color="secondary"
        aria-label="Open navigation"
        onClick={() => setMobileOpen(true)}
        sx={{
          position: "fixed",
          bottom: 24,
          left: 24,
          zIndex: theme.zIndex.speedDial,
          display: { xs: "flex", md: "none" },
          bgcolor: "rgba(255, 255, 255, 0.86)",
          color: "primary.main",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          border: "1px solid rgba(79, 70, 229, 0.18)",
          boxShadow: "0 16px 32px -18px rgba(30, 27, 75, 0.6)",
          "&:hover": { bgcolor: "rgba(255, 255, 255, 0.96)" },
        }}
      >
        <MenuIcon />
      </Fab>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          minWidth: 0,
          minHeight: "100vh",
          bgcolor: "background.default",
          backgroundImage:
            "radial-gradient(900px circle at 0% 0%, rgba(79, 70, 229, 0.12), transparent 45%), radial-gradient(700px circle at 100% 0%, rgba(8, 145, 178, 0.1), transparent 40%)",
          backgroundAttachment: "fixed",
        }}
      >
        <Container maxWidth="lg" sx={{ py: 4 }}>
          {children}
        </Container>
      </Box>

      <GlassglowSnackbar />
    </Box>
  );
}
