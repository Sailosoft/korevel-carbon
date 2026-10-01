"use client";

import Grid from "@mui/material/Grid";
import Stack from "@mui/material/Stack";
import { FacilityLeaderboardCard } from "./overview/FacilityLeaderboardCard";
import { HotspotCard } from "./overview/HotspotCard";
import { MonthlyTrendCard } from "./overview/MonthlyTrendCard";
import { OverviewKpis } from "./overview/OverviewKpis";
import { ScopeBreakdownCard } from "./overview/ScopeBreakdownCard";
import { TargetProgressCard } from "./overview/TargetProgressCard";
import { PortalPageHeader } from "./PortalPageHeader";

export function CarbonPortalHome() {
  return (
    <Stack spacing={3}>
      <PortalPageHeader
        title="Overview"
        subtitle="Rolling 12-month carbon performance across all facilities, computed live from activity data."
      />
      <OverviewKpis />
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 5 }}>
          <ScopeBreakdownCard />
        </Grid>
        <Grid size={{ xs: 12, md: 7 }}>
          <MonthlyTrendCard />
        </Grid>
        <Grid size={{ xs: 12, md: 7 }}>
          <TargetProgressCard />
        </Grid>
        <Grid size={{ xs: 12, md: 5 }}>
          <FacilityLeaderboardCard />
        </Grid>
        <Grid size={12}>
          <HotspotCard />
        </Grid>
      </Grid>
    </Stack>
  );
}
