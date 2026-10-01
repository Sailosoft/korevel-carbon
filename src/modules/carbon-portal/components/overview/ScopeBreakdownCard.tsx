"use client";

import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { PieChart } from "@mui/x-charts/PieChart";
import { useScopeBreakdown } from "../../hooks/useCarbonData";
import { formatPercent, formatTonnes } from "../../lib/format";
import { SCOPE_COLORS } from "../../theme";
import { LoadingBox } from "../LoadingBox";
import { SectionCard } from "../SectionCard";
import { ScopeLegendDot } from "../chips";

export function ScopeBreakdownCard() {
  const breakdown = useScopeBreakdown();

  if (!breakdown) {
    return (
      <SectionCard title="Scope breakdown" subtitle="Share of rolling 12-month emissions">
        <LoadingBox />
      </SectionCard>
    );
  }

  const hasData = breakdown.some((item) => item.tonnes > 0);

  return (
    <SectionCard title="Scope breakdown" subtitle="Share of rolling 12-month emissions">
      {hasData ? (
        <PieChart
          height={230}
          series={[
            {
              data: breakdown.map((item) => ({
                id: `scope-${item.scope}`,
                label: `Scope ${item.scope}`,
                value: item.tonnes,
                color: SCOPE_COLORS[item.scope],
              })),
              innerRadius: 52,
              outerRadius: 88,
              paddingAngle: 2,
              highlightScope: { fade: "global", highlight: "item" },
            },
          ]}
          slotProps={{ legend: { position: { vertical: "bottom" } } }}
        />
      ) : (
        <LoadingBox height={230} />
      )}
      <Stack spacing={1}>
        {breakdown.map((item) => (
          <Stack
            key={item.scope}
            direction="row"
            spacing={1}
            sx={{ justifyContent: "space-between", alignItems: "center" }}
          >
            <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
              <ScopeLegendDot scope={item.scope} />
              <Typography variant="body2">Scope {item.scope}</Typography>
            </Stack>
            <Box>
              <Typography variant="body2" component="span" sx={{ fontWeight: 700 }}>
                {formatTonnes(item.tonnes)} t
              </Typography>
              <Typography variant="body2" color="text.secondary" component="span" sx={{ ml: 1 }}>
                {formatPercent(item.pctOfTotal, 1)}
              </Typography>
            </Box>
          </Stack>
        ))}
      </Stack>
    </SectionCard>
  );
}
