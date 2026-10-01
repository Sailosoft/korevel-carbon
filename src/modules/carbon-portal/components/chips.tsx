"use client";

import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import { alpha } from "@mui/material/styles";
import type { DataQuality, Scope } from "../db/types";
import { SCOPE_COLORS } from "../theme";

export function ScopeChip({ scope }: { scope: Scope }) {
  return (
    <Chip
      size="small"
      label={`Scope ${scope}`}
      sx={{
        fontWeight: 600,
        bgcolor: alpha(SCOPE_COLORS[scope], 0.14),
        color: SCOPE_COLORS[scope],
      }}
    />
  );
}

export function ScopeLegendDot({ scope }: { scope: Scope }) {
  return (
    <Box
      sx={{
        width: 10,
        height: 10,
        borderRadius: "50%",
        bgcolor: SCOPE_COLORS[scope],
        flexShrink: 0,
      }}
    />
  );
}

/**
 * Delta indicator where a falling number (lower emissions) is an improvement.
 */
export function TrendChip({ value }: { value: number }) {
  const color = value === 0 ? "default" : value < 0 ? "success" : "error";
  const sign = value > 0 ? "+" : "";
  return <Chip size="small" color={color} label={`${sign}${value.toFixed(1)}%`} />;
}

const QUALITY_LABEL: Record<DataQuality, string> = {
  primary: "Primary",
  secondary: "Secondary",
  spend_based: "Spend-based",
};

export function QualityChip({ quality }: { quality: DataQuality }) {
  return (
    <Chip
      size="small"
      variant="outlined"
      label={QUALITY_LABEL[quality]}
      color={quality === "primary" ? "success" : quality === "secondary" ? "default" : "warning"}
    />
  );
}
