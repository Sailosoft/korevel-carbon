"use client";

import Stack from "@mui/material/Stack";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Typography from "@mui/material/Typography";
import { useFacilityLeaderboard } from "../../hooks/useCarbonData";
import { formatTonnes } from "../../lib/format";
import { LoadingBox } from "../LoadingBox";
import { SectionCard } from "../SectionCard";
import { TrendChip } from "../chips";

export function FacilityLeaderboardCard() {
  const leaderboard = useFacilityLeaderboard();

  if (!leaderboard) {
    return (
      <SectionCard title="Facility leaderboard" subtitle="Sites ranked by emissions">
        <LoadingBox height={240} />
      </SectionCard>
    );
  }

  if (leaderboard.length === 0) {
    return (
      <SectionCard title="Facility leaderboard" subtitle="Sites ranked by emissions">
        <Typography variant="body2" color="text.secondary">
          No facilities yet.
        </Typography>
      </SectionCard>
    );
  }

  return (
    <SectionCard title="Facility leaderboard" subtitle="Sites ranked by rolling 12-month emissions">
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Facility</TableCell>
            <TableCell align="right">Emissions</TableCell>
            <TableCell align="right">t/m²</TableCell>
            <TableCell align="right">Trend</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {leaderboard.map((item, index) => (
            <TableRow key={item.facilityId} hover>
              <TableCell>
                <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ minWidth: 16, fontFamily: "monospace" }}
                  >
                    {index + 1}
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {item.name}
                  </Typography>
                </Stack>
              </TableCell>
              <TableCell align="right" sx={{ whiteSpace: "nowrap" }}>
                {formatTonnes(item.tonnes)} t
              </TableCell>
              <TableCell align="right">{item.intensityPerM2}</TableCell>
              <TableCell align="right">
                <TrendChip value={item.yoyDeltaPct} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </SectionCard>
  );
}
