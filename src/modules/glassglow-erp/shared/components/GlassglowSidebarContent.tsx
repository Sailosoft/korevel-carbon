"use client";

import { Fragment } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import ArrowOutwardIcon from "@mui/icons-material/ArrowOutward";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import ListSubheader from "@mui/material/ListSubheader";
import List from "@mui/material/List";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import { CATALOG_HREF, GLASSGLOW_NAV_GROUPS } from "../navigation";
import { useUiStore } from "../../stores/uiStore";

type GlassglowSidebarContentProps = {
  collapsed: boolean;
  showCollapseToggle: boolean;
  onNavigate?: () => void;
};

const BRAND_TILE_SX = {
  width: 36,
  height: 36,
  flexShrink: 0,
  borderRadius: "11px",
  background: "linear-gradient(135deg, #4f46e5 0%, #0891b2 100%)",
  color: "#ffffff",
  display: "grid",
  placeItems: "center",
  fontWeight: 800,
  fontSize: 15,
  boxShadow: "0 10px 24px -12px rgba(79, 70, 229, 0.8)",
} as const;

export function GlassglowSidebarContent({
  collapsed,
  showCollapseToggle,
  onNavigate,
}: GlassglowSidebarContentProps) {
  const pathname = usePathname();
  const toggleSidebarCollapsed = useUiStore((state) => state.toggleSidebarCollapsed);

  return (
    <Box
      data-glassglow-sidebar
      sx={{ display: "flex", flexDirection: "column", height: "100%", minHeight: 0 }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: collapsed ? "center" : "flex-start",
          gap: 1.25,
          px: collapsed ? 0 : 2,
          py: 2,
          flexShrink: 0,
        }}
      >
        {showCollapseToggle ? (
          <IconButton
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            onClick={toggleSidebarCollapsed}
            sx={{
              ...BRAND_TILE_SX,
              position: "relative",
              p: 0,
              "& .brand-initial, & .brand-chevron": {
                position: "absolute",
                inset: 0,
                display: "grid",
                placeItems: "center",
                transition: "opacity 120ms ease",
              },
              "& .brand-chevron": { opacity: 0 },
              "&:hover .brand-initial": { opacity: 0 },
              "&:hover .brand-chevron": { opacity: 1 },
            }}
          >
            <Box component="span" className="brand-initial">
              G
            </Box>
            <Box component="span" className="brand-chevron">
              {collapsed ? <ChevronRightIcon fontSize="small" /> : <ChevronLeftIcon fontSize="small" />}
            </Box>
          </IconButton>
        ) : (
          <Box aria-hidden sx={BRAND_TILE_SX}>
            G
          </Box>
        )}
        {!collapsed && (
          <Typography
            variant="subtitle1"
            sx={{ fontWeight: 800, letterSpacing: "-0.01em", whiteSpace: "nowrap" }}
          >
            Glassglow ERP
          </Typography>
        )}
      </Box>

      <List
        component="nav"
        aria-label="Primary"
        disablePadding
        sx={{ flex: 1, minHeight: 0, overflowY: "auto", pb: 1 }}
      >
        {GLASSGLOW_NAV_GROUPS.map((group) => (
          <Fragment key={group.id}>
            {!collapsed && (
              <ListSubheader
                component="div"
                disableSticky
                sx={{
                  mx: 1,
                  mt: 1.5,
                  px: 1.5,
                  py: 0.25,
                  bgcolor: "transparent",
                  color: "text.secondary",
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  lineHeight: 1.6,
                }}
              >
                {group.label}
              </ListSubheader>
            )}
            {group.items.map((item) => {
              const selected = pathname === item.href;
              const icon = <item.icon fontSize="small" />;
              return (
                <ListItemButton
                  key={item.href}
                  component={Link}
                  href={item.href}
                  selected={selected}
                  onClick={onNavigate}
                  sx={{
                    mx: 1,
                    mb: 0.5,
                    borderRadius: 2,
                    minHeight: 44,
                    justifyContent: collapsed ? "center" : "flex-start",
                    px: collapsed ? 0 : 2,
                    "&.Mui-selected": {
                      bgcolor: "rgba(79, 70, 229, 0.12)",
                      "&:hover": { bgcolor: "rgba(79, 70, 229, 0.16)" },
                    },
                  }}
                >
                  <ListItemIcon
                    sx={{
                      minWidth: collapsed ? 0 : 40,
                      mr: collapsed ? 0 : 1.5,
                      justifyContent: "center",
                      color: selected ? "primary.main" : "text.secondary",
                    }}
                  >
                    {collapsed ? (
                      <Tooltip title={item.label} placement="right">
                        {icon}
                      </Tooltip>
                    ) : (
                      icon
                    )}
                  </ListItemIcon>
                  {!collapsed && (
                    <ListItemText
                      primary={item.label}
                      slotProps={{
                        primary: {
                          sx: { fontSize: 14.5, fontWeight: 600, whiteSpace: "nowrap" },
                        },
                      }}
                    />
                  )}
                </ListItemButton>
              );
            })}
          </Fragment>
        ))}
      </List>

      <Box
        sx={{
          flexShrink: 0,
          mt: "auto",
          px: 1,
          pt: 1,
          pb: 1.5,
          borderTop: "1px solid rgba(79, 70, 229, 0.12)",
        }}
      >
        <ListItemButton
          component={Link}
          href={CATALOG_HREF}
          onClick={onNavigate}
          sx={{
            borderRadius: 2,
            minHeight: 44,
            justifyContent: collapsed ? "center" : "flex-start",
            px: collapsed ? 0 : 2,
          }}
        >
          <ListItemIcon sx={{ minWidth: collapsed ? 0 : 40, mr: collapsed ? 0 : 1.5, justifyContent: "center" }}>
            {collapsed ? (
              <Tooltip title="Catalog" placement="right">
                <ArrowOutwardIcon fontSize="small" />
              </Tooltip>
            ) : (
              <ArrowOutwardIcon fontSize="small" />
            )}
          </ListItemIcon>
          {!collapsed && (
            <ListItemText
              primary="Catalog"
              slotProps={{ primary: { sx: { fontSize: 14.5, fontWeight: 600 } } }}
            />
          )}
        </ListItemButton>
      </Box>
    </Box>
  );
}
