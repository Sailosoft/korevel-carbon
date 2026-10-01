"use client";

import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import {
  EASE,
  entrance,
  headlinePan,
  pulseGlow,
  reducedMotion,
  scaleIn,
} from "../animations";
import type { CatalogCounts } from "../catalogFilters";
import { useCountUp } from "../hooks/useCountUp";
import { SparkIcon } from "./icons";

const MONO = "var(--font-geist-mono), monospace";

type CatalogHeroProps = {
  counts: CatalogCounts;
};

function StatTile({
  value,
  label,
  accent,
  delay,
}: {
  value: number;
  label: string;
  accent: string;
  delay: number;
}) {
  const animatedValue = useCountUp(value);

  return (
    <Box
      sx={{
        flex: 1,
        minWidth: 0,
        px: 2.5,
        py: 2,
        borderRadius: 3,
        border: "1px solid",
        borderColor: "rgba(233, 242, 239, 0.09)",
        bgcolor: "rgba(255, 255, 255, 0.03)",
        transition: `border-color 0.4s ${EASE}, transform 0.4s ${EASE}, box-shadow 0.4s ${EASE}`,
        "&:hover": {
          transform: "translateY(-4px)",
          borderColor: `${accent}55`,
          boxShadow: `0 18px 40px -24px ${accent}66`,
        },
        ...entrance(delay, 700),
        ...reducedMotion,
      }}
    >
      <Typography
        component="p"
        sx={{
          fontFamily: MONO,
          fontSize: { xs: 30, md: 34 },
          fontWeight: 600,
          lineHeight: 1.1,
          fontVariantNumeric: "tabular-nums",
          backgroundImage: `linear-gradient(120deg, #e9f2ef 20%, ${accent} 120%)`,
          WebkitBackgroundClip: "text",
          backgroundClip: "text",
          color: "transparent",
        }}
      >
        {animatedValue}
      </Typography>
      <Typography
        component="p"
        sx={{
          mt: 0.75,
          fontSize: 11,
          fontWeight: 600,
          letterSpacing: "0.16em",
          textTransform: "uppercase",
          color: "text.secondary",
        }}
      >
        {label}
      </Typography>
    </Box>
  );
}

export function CatalogHero({ counts }: CatalogHeroProps) {
  const lineOne = ["The", "launchpad", "for"];

  return (
    <Box component="header" sx={{ textAlign: "left", mb: { xs: 5, md: 7 } }}>
      <Box
        sx={{
          display: "inline-flex",
          alignItems: "center",
          gap: 1,
          px: 1.5,
          py: 0.75,
          mb: 3,
          borderRadius: 999,
          border: "1px solid",
          borderColor: "rgba(45, 212, 191, 0.35)",
          bgcolor: "rgba(45, 212, 191, 0.07)",
          ...entrance(80, 700),
          ...reducedMotion,
        }}
      >
        <Box
          sx={{
            width: 7,
            height: 7,
            borderRadius: "50%",
            bgcolor: "#34e0a1",
            boxShadow: "0 0 12px rgba(52, 224, 161, 0.9)",
            animation: `${pulseGlow} 2.2s ease-in-out infinite`,
          }}
        />
        <Typography
          component="span"
          sx={{
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: "#8ef0d4",
          }}
        >
          Application catalog
        </Typography>
      </Box>

      <Typography
        component="h1"
        variant="h2"
        sx={{
          fontWeight: 700,
          fontSize: { xs: "2.6rem", sm: "3.4rem", md: "4.2rem" },
          lineHeight: 1.02,
          letterSpacing: "-0.04em",
          display: "flex",
          flexWrap: "wrap",
          columnGap: "0.3em",
          rowGap: 0.5,
        }}
      >
        {lineOne.map((word, index) => (
          <Box
            key={word}
            component="span"
            sx={{
              color: "rgba(233, 242, 239, 0.68)",
              ...entrance(160 + index * 90, 800),
              ...reducedMotion,
            }}
          >
            {word}
          </Box>
        ))}
        <Box
          component="span"
          sx={{
            fontWeight: 700,
            backgroundImage:
              "linear-gradient(90deg, #34e0a1, #38bdf8, #a78bfa, #34e0a1)",
            backgroundSize: "200% 100%",
            WebkitBackgroundClip: "text",
            backgroundClip: "text",
            color: "transparent",
            animation: `${headlinePan} 7s linear infinite, ${scaleIn} 800ms ${EASE} 440ms both`,
            ...reducedMotion,
          }}
        >
          net-zero operations.
        </Box>
      </Typography>

      <Typography
        component="p"
        sx={{
          mt: 3,
          maxWidth: 640,
          fontSize: { xs: 16, md: 18 },
          lineHeight: 1.65,
          color: "text.secondary",
          ...entrance(620, 800),
          ...reducedMotion,
        }}
      >
        Explore every Korevel application from a single, focused catalog.
        Search, filter, and launch the tools your sustainability team relies on
        in one click.
      </Typography>

      <Stack
        direction="row"
        spacing={2}
        sx={{
          mt: 5,
          flexDirection: { xs: "column", sm: "row" },
          alignItems: { xs: "stretch", sm: "flex-start" },
        }}
      >
        <StatTile
          value={counts.total}
          label="Total apps"
          accent="#34e0a1"
          delay={780}
        />
        <StatTile
          value={counts.available}
          label="Available now"
          accent="#38bdf8"
          delay={900}
        />
        <StatTile
          value={counts.comingSoon}
          label="Coming soon"
          accent="#a78bfa"
          delay={1020}
        />
      </Stack>

      <Box
        sx={{
          display: "inline-flex",
          alignItems: "center",
          gap: 1,
          mt: 4,
          color: "rgba(233, 242, 239, 0.4)",
          ...entrance(1140, 800),
          ...reducedMotion,
        }}
      >
        <SparkIcon size={14} />
        <Typography
          component="span"
          sx={{ fontSize: 12.5, fontFamily: MONO, letterSpacing: "0.04em" }}
        >
          curated suite · updated continuously
        </Typography>
      </Box>
    </Box>
  );
}
