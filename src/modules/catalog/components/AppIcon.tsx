"use client";

import type { ReactElement } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import type { AppDescriptor } from "@/modules/registry";
import type { AppVisual } from "../appVisuals";
import { GridIcon, LeafIcon, SlidersIcon, SparkIcon } from "./icons";

const APP_GLYPHS: Record<string, (props: { size?: number }) => ReactElement> = {
  "carbon-portal": LeafIcon,
  reports: SlidersIcon,
  analytics: GridIcon,
};

type AppIconProps = {
  app: AppDescriptor;
  visual: AppVisual;
};

function monogram(name: string): string {
  const words = name.trim().split(/\s+/);
  if (words.length === 1) {
    return words[0].slice(0, 2).toUpperCase();
  }
  return (words[0][0] + words[1][0]).toUpperCase();
}

export function AppIcon({ app, visual }: AppIconProps) {
  const Glyph = APP_GLYPHS[app.id];

  return (
    <Box
      className="app-icon"
      sx={{
        position: "relative",
        width: 56,
        height: 56,
        flexShrink: 0,
        display: "grid",
        placeItems: "center",
        borderRadius: 3,
        overflow: "hidden",
        color: "#04110e",
        background: visual.gradient,
        boxShadow: `0 14px 32px -14px ${visual.glow}`,
        transition: "transform 0.5s cubic-bezier(0.22, 1, 0.36, 1)",
        "&::after": {
          content: '""',
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(135deg, rgba(255, 255, 255, 0.55), transparent 45%)",
          opacity: 0.4,
        },
      }}
    >
      <Box sx={{ position: "relative", zIndex: 1, display: "grid" }}>
        {Glyph ? (
          <Glyph size={26} />
        ) : (
          <Typography
            component="span"
            sx={{ fontWeight: 800, fontSize: 18, letterSpacing: "0.02em" }}
          >
            {monogram(app.name)}
          </Typography>
        )}
      </Box>
      <Box
        className="app-icon-spark"
        sx={{
          position: "absolute",
          top: 6,
          right: 6,
          zIndex: 1,
          display: "grid",
          color: "rgba(4, 17, 14, 0.55)",
          transition: "transform 0.5s cubic-bezier(0.22, 1, 0.36, 1)",
        }}
      >
        <SparkIcon size={10} />
      </Box>
    </Box>
  );
}
