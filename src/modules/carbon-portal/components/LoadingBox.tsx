"use client";

import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";

export function LoadingBox({ height = 200 }: { height?: number }) {
  return (
    <Box sx={{ height, display: "grid", placeItems: "center" }}>
      <CircularProgress size={28} />
    </Box>
  );
}
