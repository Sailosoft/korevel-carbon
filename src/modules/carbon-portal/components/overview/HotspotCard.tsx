"use client";

import LinearProgress from "@mui/material/LinearProgress";
import Stack from "@mui/material/Stack";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Typography from "@mui/material/Typography";
import { useHotspotTable } from "../../hooks/useCarbonData";
import { formatPercent, formatTonnes } from "../../lib/format";
import { LoadingBox } from "../LoadingBox";
import { SectionCard } from "../SectionCard";
import { TrendChip } from "../chips";

export function HotspotCard() {
  const hotspots = useHotspotTable();

  if (!hotspots) {
    return (
      <SectionCard title="Emission hotspots" subtitle="Top sources, Pareto view">
        <LoadingBox height={240} />
      </SectionCard>
    );
  }

  const top = hotspots.slice(0, 8);

  if (top.length === 0) {
    return (
      <SectionCard title="Emission hotspots" subtitle="Top sources, Pareto view">
        <Typography variant="body2" color="text.secondary">
          No emissions recorded yet.
        </Typography>
      </SectionCard>
    );
  }

  return (
    <SectionCard title="Emission hotspots" subtitle="Top sources by tonnes, with half-on-half trend">
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Source</TableCell>
            <TableCell align="right">Emissions</TableCell>
            <TableCell align="right" sx={{ width: "30%" }}>
              Share of total
            </TableCell>
            <TableCell align="right">Trend</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {top.map((item) => (
            <TableRow key={item.sourceType} hover>
              <TableCell>
                <Typography variant="body2">{item.label}</Typography>
              </TableCell>
              <TableCell align="right" sx={{ whiteSpace: "nowrap" }}>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {formatTonnes(item.tonnes)} t
                </Typography>
              </TableCell>
              <TableCell align="right">
                <Stack spacing={0.5} sx={{ alignItems: "flex-end" }}>
                  <Typography variant="body2">{formatPercent(item.pctOfTotal, 1)}</Typography>
                  <LinearProgress
                    variant="determinate"
                    value={Math.min(item.pctOfTotal, 100)}
                    sx={{ height: 5, borderRadius: 3, width: "100%" }}
                  />
                </Stack>
              </TableCell>
              <TableCell align="right">
                <TrendChip value={item.trendPct} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </SectionCard>
  );
}
