"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Stack from "@mui/material/Stack";
import Tab from "@mui/material/Tab";
import Tabs from "@mui/material/Tabs";
import Typography from "@mui/material/Typography";
import type { Route } from "next";
import { CarbonPortalBackLink } from "./CarbonPortalBackLink";

export const PORTAL_NAV = [
  { label: "Overview", href: "/modules/carbon-portal" },
  { label: "Emissions", href: "/modules/carbon-portal/emissions" },
  { label: "Scope 3", href: "/modules/carbon-portal/scope-3" },
  { label: "Targets", href: "/modules/carbon-portal/targets" },
  { label: "Reports", href: "/modules/carbon-portal/reports" },
  { label: "Settings", href: "/modules/carbon-portal/settings" },
] as const satisfies readonly { label: string; href: Route }[];

export function CarbonPortalNav() {
  const pathname = usePathname();
  const active = PORTAL_NAV.some((item) => item.href === pathname) ? pathname : false;

  return (
    <Box
      component="header"
      sx={{
        position: "sticky",
        top: 0,
        zIndex: 10,
        bgcolor: "background.paper",
        borderBottom: "1px solid",
        borderColor: "divider",
      }}
    >
      <Container maxWidth="lg">
        <Stack direction="row" spacing={2} sx={{ alignItems: "center" }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 700, whiteSpace: "nowrap" }}>
            Carbon Portal
          </Typography>
          <Tabs
            value={active}
            variant="scrollable"
            allowScrollButtonsMobile
            sx={{ minHeight: 48, flexGrow: 1 }}
          >
            {PORTAL_NAV.map((item) => (
              <Tab
                key={item.href}
                value={item.href}
                label={item.label}
                component={Link}
                href={item.href}
                sx={{ minHeight: 48, textTransform: "none", fontWeight: 600 }}
              />
            ))}
          </Tabs>
          <CarbonPortalBackLink />
        </Stack>
      </Container>
    </Box>
  );
}
