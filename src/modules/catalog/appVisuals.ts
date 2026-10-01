export type AppVisual = {
  accent: string;
  gradient: string;
  glow: string;
  tag: string;
};

const PALETTE: AppVisual[] = [
  {
    accent: "#2dd4bf",
    gradient: "linear-gradient(135deg, #2dd4bf 0%, #38bdf8 100%)",
    glow: "rgba(45, 212, 191, 0.45)",
    tag: "APPLICATION",
  },
  {
    accent: "#a78bfa",
    gradient: "linear-gradient(135deg, #a78bfa 0%, #f472b6 100%)",
    glow: "rgba(167, 139, 250, 0.45)",
    tag: "APPLICATION",
  },
  {
    accent: "#fbbf24",
    gradient: "linear-gradient(135deg, #fbbf24 0%, #fb7185 100%)",
    glow: "rgba(251, 191, 36, 0.45)",
    tag: "APPLICATION",
  },
  {
    accent: "#38bdf8",
    gradient: "linear-gradient(135deg, #38bdf8 0%, #818cf8 100%)",
    glow: "rgba(56, 189, 248, 0.45)",
    tag: "APPLICATION",
  },
];

export const DEFAULT_VISUAL: AppVisual = PALETTE[0];

export const APP_VISUALS: Record<string, AppVisual> = {
  "carbon-portal": {
    accent: "#34e0a1",
    gradient: "linear-gradient(135deg, #34e0a1 0%, #22d3ee 55%, #38bdf8 100%)",
    glow: "rgba(52, 224, 161, 0.5)",
    tag: "CORE PLATFORM",
  },
};

function hashPick(id: string): AppVisual {
  let hash = 0;
  for (let i = 0; i < id.length; i += 1) {
    hash = (hash * 31 + id.charCodeAt(i)) % PALETTE.length;
  }
  return PALETTE[hash];
}

export function getAppVisual(id: string): AppVisual {
  return APP_VISUALS[id] ?? hashPick(id);
}
