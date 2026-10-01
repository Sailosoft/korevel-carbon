"use client";

import { LineChart } from "@mui/x-charts/LineChart";
import { useMonthlyTrend } from "../../hooks/useCarbonData";
import { formatMonthShort } from "../../lib/months";
import { roundTo } from "../../lib/format";
import { SCOPE_COLORS } from "../../theme";
import { LoadingBox } from "../LoadingBox";
import { SectionCard } from "../SectionCard";

export function MonthlyTrendCard() {
  const trend = useMonthlyTrend();

  if (!trend) {
    return (
      <SectionCard title="Monthly trend" subtitle="Last 12 months by scope">
        <LoadingBox height={280} />
      </SectionCard>
    );
  }

  return (
    <SectionCard title="Monthly trend" subtitle="Last 12 months by scope (t CO2e)">
      <LineChart
        height={280}
        xAxis={[
          {
            data: trend.map((item) => formatMonthShort(item.month)),
            scaleType: "point",
          },
        ]}
        yAxis={[{ label: "t CO2e" }]}
        series={[
          {
            label: "Scope 1",
            data: trend.map((item) => roundTo(item.scope1, 1)),
            color: SCOPE_COLORS[1],
            area: false,
          },
          {
            label: "Scope 2",
            data: trend.map((item) => roundTo(item.scope2, 1)),
            color: SCOPE_COLORS[2],
            area: false,
          },
          {
            label: "Scope 3",
            data: trend.map((item) => roundTo(item.scope3, 1)),
            color: SCOPE_COLORS[3],
            area: false,
          },
        ]}
        slotProps={{ legend: { position: { vertical: "bottom" } } }}
      />
    </SectionCard>
  );
}
