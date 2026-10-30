"use client";

import Card, { type CardProps } from "@mui/material/Card";
import type { SxProps, Theme } from "@mui/material/styles";
import { GLASS_PANEL_SX } from "../../theme";

export function GlassPanel({ sx, ...rest }: CardProps) {
  const mergedSx: SxProps<Theme> = Array.isArray(sx)
    ? [GLASS_PANEL_SX, ...sx]
    : sx
      ? [GLASS_PANEL_SX, sx]
      : GLASS_PANEL_SX;

  return <Card {...rest} sx={mergedSx} />;
}
