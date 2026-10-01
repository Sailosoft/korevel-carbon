"use client";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { entrance, reducedMotion, ringPulse } from "../animations";
import { SearchIcon, SlidersIcon } from "./icons";

const MONO = "var(--font-geist-mono), monospace";

type CatalogEmptyProps = {
  hasApps: boolean;
  onClear: () => void;
};

export function CatalogEmpty({ hasApps, onClear }: CatalogEmptyProps) {
  return (
    <Stack
      spacing={3}
      sx={{
        alignItems: "center",
        py: 10,
        px: 2,
        textAlign: "center",
        ...entrance(0, 700),
        ...reducedMotion,
      }}
    >
      <Box sx={{ position: "relative", width: 132, height: 132 }}>
        {[0, 1, 2].map((ring) => (
          <Box
            key={ring}
            sx={{
              position: "absolute",
              inset: ring * 16,
              borderRadius: "50%",
              border: "1px solid",
              borderColor:
                ring === 2
                  ? "rgba(45, 212, 191, 0.4)"
                  : "rgba(233, 242, 239, 0.12)",
              animation: `${ringPulse} 2.8s ease-in-out ${ring * 0.35}s infinite`,
              ...reducedMotion,
            }}
          />
        ))}
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            display: "grid",
            placeItems: "center",
            color: "#8ef0d4",
          }}
        >
          {hasApps ? <SearchIcon size={28} /> : <SlidersIcon size={28} />}
        </Box>
      </Box>

      <Box sx={{ maxWidth: 440 }}>
        <Typography component="h2" variant="h5" sx={{ fontWeight: 700 }}>
          {hasApps ? "No applications found" : "No applications yet"}
        </Typography>
        <Typography component="p" sx={{ mt: 1.5, color: "text.secondary" }}>
          {hasApps
            ? "Nothing matches your search. Try a different keyword or reset the filters to see the full catalog."
            : "Applications registered in the catalog will appear here as soon as they are available."}
        </Typography>
      </Box>

      {hasApps ? (
        <Button
          variant="outlined"
          onClick={onClear}
          sx={{
            px: 3,
            py: 1.1,
            borderColor: "rgba(45, 212, 191, 0.45)",
            color: "#8ef0d4",
            fontFamily: MONO,
            fontSize: 13,
            "&:hover": {
              borderColor: "#2dd4bf",
              bgcolor: "rgba(45, 212, 191, 0.1)",
            },
          }}
        >
          Reset filters
        </Button>
      ) : null}
    </Stack>
  );
}
