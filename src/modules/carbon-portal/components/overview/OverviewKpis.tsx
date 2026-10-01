"use client";

import Grid from "@mui/material/Grid";
import Skeleton from "@mui/material/Skeleton";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { useOverviewKpis } from "../../hooks/useCarbonData";
import { formatPercent, formatTonnes } from "../../lib/format";
import { formatMonth } from "../../lib/months";
import { SCOPE_COLORS } from "../../theme";
import { MetricCard } from "../MetricCard";
import { TrendChip } from "../chips";

function KpiSkeleton() {
  return (
    <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
      <Skeleton variant="rounded" height={108} />
    </Grid>
  );
}

export function OverviewKpis() {
  const kpis = useOverviewKpis();

  if (!kpis) {
    return (
      <Grid container spacing={2}>
        {Array.from({ length: 7 }, (_, index) => (
          <KpiSkeleton key={index} />
        ))}
      </Grid>
    );
  }

  const windowLabel = `${formatMonth(kpis.window.start)} – ${formatMonth(kpis.window.end)}`;

  return (
    <Grid container spacing={2}>
      <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
        <MetricCard
          label={`Total · ${windowLabel}`}
          value={`${formatTonnes(kpis.totalTonnes)} t`}
          caption={
            <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
              <TrendChip value={kpis.yoyDeltaPct} />
              <Typography variant="caption" color="text.secondary">
                vs prior period
              </Typography>
            </Stack>
          }
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
        <MetricCard
          label="Scope 1"
          value={`${formatTonnes(kpis.scope1)} t`}
          accent={SCOPE_COLORS[1]}
          caption={
            <Typography variant="caption" color="text.secondary">
              Direct combustion and fleet
            </Typography>
          }
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
        <MetricCard
          label="Scope 2"
          value={`${formatTonnes(kpis.scope2)} t`}
          accent={SCOPE_COLORS[2]}
          caption={
            <Typography variant="caption" color="text.secondary">
              Purchased electricity and heat
            </Typography>
          }
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
        <MetricCard
          label="Scope 3"
          value={`${formatTonnes(kpis.scope3)} t`}
          accent={SCOPE_COLORS[3]}
          caption={
            <Typography variant="caption" color="text.secondary">
              Value chain emissions
            </Typography>
          }
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 4, lg: 4 }}>
        <MetricCard
          label="Emissions intensity"
          value={`${kpis.intensityPerM2} t/m²`}
          caption={
            <Typography variant="caption" color="text.secondary">
              Per m² of total floor area
            </Typography>
          }
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 4, lg: 4 }}>
        <MetricCard
          label="Active projects"
          value={String(kpis.activeProjects)}
          caption={
            <Typography variant="caption" color="text.secondary">
              Proposed or in progress
            </Typography>
          }
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 4, lg: 4 }}>
        <MetricCard
          label="Data quality"
          value={formatPercent(kpis.dataQualityPct, 1)}
          caption={
            <Typography variant="caption" color="text.secondary">
              Primary data share of activities
            </Typography>
          }
        />
      </Grid>
    </Grid>
  );
}
