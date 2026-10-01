"use client";

import Chip from "@mui/material/Chip";
import LinearProgress from "@mui/material/LinearProgress";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { useTargetProgress } from "../../hooks/useCarbonData";
import { formatPercent, formatTonnes } from "../../lib/format";
import { LoadingBox } from "../LoadingBox";
import { SectionCard } from "../SectionCard";

export function TargetProgressCard() {
  const progress = useTargetProgress();

  if (!progress) {
    return (
      <SectionCard title="Target progress" subtitle="Reduction pathways vs baseline">
        <LoadingBox />
      </SectionCard>
    );
  }

  if (progress.length === 0) {
    return (
      <SectionCard title="Target progress" subtitle="Reduction pathways vs baseline">
        <Typography variant="body2" color="text.secondary">
          No targets defined yet. Create one on the Targets screen.
        </Typography>
      </SectionCard>
    );
  }

  return (
    <SectionCard title="Target progress" subtitle="Current 12-month run rate vs target year">
      <List disablePadding sx={{ display: "grid", gap: 2 }}>
        {progress.map((item) => {
          const barValue = Math.min(Math.max(item.pctToTarget, 0), 100);
          return (
            <ListItem key={item.targetId} disableGutters sx={{ display: "block" }}>
              <Stack spacing={0.75}>
                <Stack
                  direction="row"
                  spacing={1}
                  sx={{ justifyContent: "space-between", alignItems: "center" }}
                >
                  <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                    {item.name}
                  </Typography>
                  <Chip size="small" variant="outlined" label={`Scope ${item.scope}`} />
                </Stack>
                <Stack
                  direction="row"
                  spacing={1}
                  sx={{ justifyContent: "space-between", alignItems: "center" }}
                >
                  <Typography variant="caption" color="text.secondary">
                    {formatTonnes(item.currentTonnes)} t now → {formatTonnes(item.targetTonnes)} t by{" "}
                    {item.targetYear} · project {formatTonnes(item.projectionTonnes)} t
                  </Typography>
                  <Stack direction="row" spacing={0.75}>
                    <Chip
                      size="small"
                      color="primary"
                      variant="outlined"
                      label={formatPercent(item.pctToTarget, 0)}
                    />
                    <Chip
                      size="small"
                      color={item.onTrack ? "success" : "warning"}
                      label={item.onTrack ? "On track" : "Off track"}
                    />
                  </Stack>
                </Stack>
                <LinearProgress
                  variant="determinate"
                  value={barValue}
                  sx={{ height: 8, borderRadius: 4 }}
                />
              </Stack>
            </ListItem>
          );
        })}
      </List>
    </SectionCard>
  );
}
