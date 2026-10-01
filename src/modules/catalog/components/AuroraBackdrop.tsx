"use client";

import Box from "@mui/material/Box";
import { auroraDrift, slowSpin, reducedMotion } from "../animations";

export function AuroraBackdrop() {
  return (
    <Box
      aria-hidden
      sx={{
        position: "absolute",
        inset: 0,
        overflow: "hidden",
        pointerEvents: "none",
        zIndex: 0,
      }}
    >
      <Box
        sx={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(120% 70% at 50% -15%, rgba(45, 212, 191, 0.16), transparent 60%), linear-gradient(180deg, #060a09 0%, #050807 45%, #040605 100%)",
        }}
      />
      <Box
        sx={{
          position: "absolute",
          top: -180,
          left: -140,
          width: 520,
          height: 520,
          borderRadius: "50%",
          bgcolor: "rgba(45, 212, 191, 0.22)",
          filter: "blur(100px)",
          animation: `${auroraDrift} 28s ease-in-out infinite`,
          ...reducedMotion,
        }}
      />
      <Box
        sx={{
          position: "absolute",
          top: -120,
          right: -160,
          width: 560,
          height: 560,
          borderRadius: "50%",
          bgcolor: "rgba(56, 189, 248, 0.18)",
          filter: "blur(110px)",
          animation: `${auroraDrift} 34s ease-in-out 2s infinite reverse`,
          ...reducedMotion,
        }}
      />
      <Box
        sx={{
          position: "absolute",
          bottom: -240,
          left: "35%",
          width: 640,
          height: 640,
          borderRadius: "50%",
          bgcolor: "rgba(167, 139, 250, 0.12)",
          filter: "blur(120px)",
          animation: `${auroraDrift} 40s ease-in-out 4s infinite`,
          ...reducedMotion,
        }}
      />
      <Box
        sx={{
          position: "absolute",
          top: -260,
          left: "50%",
          width: 560,
          height: 560,
          ml: -280,
          borderRadius: "50%",
          border: "1px solid rgba(45, 212, 191, 0.16)",
          background:
            "conic-gradient(from 0deg, transparent 0deg, rgba(45, 212, 191, 0.35) 60deg, transparent 140deg, transparent 360deg)",
          maskImage:
            "radial-gradient(closest-side, transparent 78%, black 80%)",
          WebkitMaskImage:
            "radial-gradient(closest-side, transparent 78%, black 80%)",
          animation: `${slowSpin} 26s linear infinite`,
          ...reducedMotion,
        }}
      />
      <Box
        sx={{
          position: "absolute",
          inset: 0,
          backgroundImage:
            "linear-gradient(rgba(255, 255, 255, 0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.035) 1px, transparent 1px)",
          backgroundSize: "72px 72px",
          maskImage:
            "radial-gradient(85% 55% at 50% 0%, black 20%, transparent 100%)",
          WebkitMaskImage:
            "radial-gradient(85% 55% at 50% 0%, black 20%, transparent 100%)",
        }}
      />
      <Box
        sx={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(100% 60% at 50% 100%, rgba(4, 6, 5, 0.85), transparent 70%)",
        }}
      />
    </Box>
  );
}
