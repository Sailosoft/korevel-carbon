"use client";

import type { MouseEvent, ReactNode } from "react";
import Link from "next/link";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Chip from "@mui/material/Chip";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import type { AppDescriptor } from "@/modules/registry";
import { EASE, entrance, pulseGlow, reducedMotion } from "../animations";
import { getAppVisual } from "../appVisuals";
import { AppIcon } from "./AppIcon";
import { ArrowUpRightIcon } from "./icons";

const MONO = "var(--font-geist-mono), monospace";

type AppCardProps = {
  app: AppDescriptor;
  index?: number;
  delayBase?: number;
};

export function AppCard({
  app,
  index = 0,
  delayBase = 0,
}: AppCardProps) {
  const visual = getAppVisual(app.id);
  const interactive = app.status === "available";

  const trackSpotlight = (event: MouseEvent<HTMLDivElement>) => {
    const bounds = event.currentTarget.getBoundingClientRect();
    event.currentTarget.style.setProperty(
      "--spot-x",
      `${event.clientX - bounds.left}px`,
    );
    event.currentTarget.style.setProperty(
      "--spot-y",
      `${event.clientY - bounds.top}px`,
    );
  };

  const body = (
    <CardContent
      sx={{
        position: "relative",
        zIndex: 1,
        p: 3,
        height: "100%",
        display: "flex",
        flexDirection: "column",
        "&:last-child": { pb: 3 },
      }}
    >
      <Stack
        direction="row"
        spacing={1.5}
        sx={{ alignItems: "flex-start", justifyContent: "space-between" }}
      >
        <AppIcon app={app} visual={visual} />
        {app.status === "available" ? (
          <Box
            sx={{
              display: "inline-flex",
              alignItems: "center",
              gap: 0.75,
              px: 1.1,
              py: 0.5,
              borderRadius: 999,
              border: "1px solid",
              borderColor: "rgba(74, 222, 128, 0.35)",
              bgcolor: "rgba(74, 222, 128, 0.08)",
            }}
          >
            <Box
              sx={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                bgcolor: "#4ade80",
                boxShadow: "0 0 10px rgba(74, 222, 128, 0.9)",
                animation: `${pulseGlow} 2s ease-in-out infinite`,
              }}
            />
            <Typography
              component="span"
              sx={{ fontSize: 11, fontWeight: 700, color: "#86efac" }}
            >
              Live
            </Typography>
          </Box>
        ) : (
          <Chip size="small" variant="outlined" label="Coming soon" />
        )}
      </Stack>

      <Typography
        component="h2"
        sx={{
          mt: 2.5,
          fontSize: 20,
          fontWeight: 700,
          letterSpacing: "-0.02em",
          color: "text.primary",
        }}
      >
        {app.name}
      </Typography>

      <Typography
        component="p"
        sx={{
          mt: 1,
          fontSize: 14,
          lineHeight: 1.6,
          color: "text.secondary",
          display: "-webkit-box",
          WebkitLineClamp: 2,
          WebkitBoxOrient: "vertical",
          overflow: "hidden",
        }}
      >
        {app.description}
      </Typography>

      <Box sx={{ flex: 1, minHeight: 16 }} />

      <Stack
        direction="row"
        sx={{
          alignItems: "center",
          justifyContent: "space-between",
          mt: 2.5,
          pt: 2.25,
          borderTop: "1px solid",
          borderColor: "rgba(233, 242, 239, 0.08)",
        }}
      >
        <Typography
          component="span"
          sx={{
            fontFamily: MONO,
            fontSize: 10.5,
            fontWeight: 700,
            letterSpacing: "0.16em",
            color: visual.accent,
          }}
        >
          {visual.tag}
        </Typography>

        <Stack
          className="card-cta"
          direction="row"
          spacing={0.75}
          sx={{
            alignItems: "center",
            transition: `transform 0.45s ${EASE}`,
          }}
        >
          <Typography
            component="span"
            sx={{ fontSize: 12.5, fontWeight: 700, color: "text.primary" }}
          >
            {interactive ? "Launch app" : "In progress"}
          </Typography>
          <Box
            sx={{
              width: 26,
              height: 26,
              display: "grid",
              placeItems: "center",
              borderRadius: "50%",
              border: "1px solid",
              borderColor: interactive ? `${visual.accent}66` : "divider",
              color: interactive ? visual.accent : "text.secondary",
              transition: `all 0.45s ${EASE}`,
            }}
          >
            <ArrowUpRightIcon size={13} />
          </Box>
        </Stack>
      </Stack>
    </CardContent>
  );

  const content: ReactNode = interactive ? (
    <Link
      href={app.href}
      style={{
        display: "block",
        height: "100%",
        color: "inherit",
        textDecoration: "none",
      }}
    >
      {body}
    </Link>
  ) : (
    <Box sx={{ height: "100%" }}>{body}</Box>
  );

  return (
    <Box
      className="app-card-root"
      sx={{
        position: "relative",
        height: "100%",
        minHeight: 300,
        ...entrance(delayBase + index * 90, 750),
        ...reducedMotion,
      }}
    >
      <Card
        onMouseMove={trackSpotlight}
        variant="outlined"
        sx={{
          position: "relative",
          height: "100%",
          overflow: "hidden",
          borderRadius: 4,
          bgcolor: "rgba(11, 18, 16, 0.66)",
          backdropFilter: "blur(10px)",
          WebkitBackdropFilter: "blur(10px)",
          border: "1px solid rgba(233, 242, 239, 0.08)",
          backgroundImage:
            "linear-gradient(160deg, rgba(255, 255, 255, 0.05), rgba(255, 255, 255, 0.012) 45%, rgba(255, 255, 255, 0.03))",
          transition: `transform 0.5s ${EASE}, box-shadow 0.5s ${EASE}, border-color 0.5s ${EASE}`,
          "&:hover, &:focus-within": {
            transform: "translateY(-8px)",
            borderColor: `${visual.accent}59`,
            boxShadow: `0 34px 70px -34px ${visual.glow}, 0 0 0 1px ${visual.accent}22`,
          },
          "&:focus-within": {
            outline: `2px solid ${visual.accent}`,
            outlineOffset: 3,
          },
          "& a:focus-visible": { outline: "none" },
          "&::before": {
            content: '""',
            position: "absolute",
            inset: 0,
            background: `radial-gradient(340px circle at var(--spot-x, 50%) var(--spot-y, 0%), ${visual.accent}24, transparent 65%)`,
            opacity: 0,
            transition: "opacity 0.45s ease",
            pointerEvents: "none",
          },
          "&:hover::before, &:focus-within::before": { opacity: 1 },
          "&::after": {
            content: '""',
            position: "absolute",
            top: 0,
            bottom: 0,
            left: 0,
            width: "42%",
            background:
              "linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.07), transparent)",
            transform: "translateX(-160%) skewX(-18deg)",
            transition: "transform 1s cubic-bezier(0.22, 1, 0.36, 1)",
            pointerEvents: "none",
          },
          "&:hover::after": { transform: "translateX(340%) skewX(-18deg)" },
          "&:hover .app-icon": {
            transform: "translateY(-3px) rotate(-5deg) scale(1.05)",
          },
          "&:hover .app-icon-spark": { transform: "rotate(90deg)" },
          "&:hover .card-cta": { transform: "translateX(4px)" },
          "&:hover .card-cta > div": {
            bgcolor: visual.accent,
            borderColor: visual.accent,
            color: "#04110e",
          },
          "&:hover .card-accent-line": { transform: "scaleX(1)" },
          "&:focus-within .card-accent-line": { transform: "scaleX(1)" },
          ...reducedMotion,
        }}
      >
        <Box
          className="card-accent-line"
          aria-hidden
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 3,
            zIndex: 2,
            background: visual.gradient,
            transform: "scaleX(0)",
            transformOrigin: "left",
            transition: `transform 0.6s ${EASE}`,
          }}
        />
        {content}
      </Card>
    </Box>
  );
}
