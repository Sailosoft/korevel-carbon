"use client";

import { useState } from "react";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import LinearProgress from "@mui/material/LinearProgress";
import Stack from "@mui/material/Stack";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Typography from "@mui/material/Typography";
import type { Target, TargetStatus } from "../../db/types";
import { useTargetProgress, useTargets } from "../../hooks/useCarbonData";
import { formatPercent, formatTonnes } from "../../lib/format";
import { deleteTarget } from "../../services/records";
import { SectionCard } from "../SectionCard";
import { TargetDialog } from "./TargetDialog";

const STATUS_COLOR: Record<TargetStatus, "default" | "primary" | "success" | "warning"> = {
  draft: "default",
  committed: "primary",
  achieved: "success",
  at_risk: "warning",
};

export function TargetsPanel() {
  const targets = useTargets();
  const progress = useTargetProgress();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Target | null>(null);

  const progressById = new Map((progress ?? []).map((item) => [item.targetId, item]));

  return (
    <SectionCard
      title="Targets"
      subtitle="Reduction targets with live progress from current emissions"
      actions={
        <Button
          size="small"
          variant="outlined"
          onClick={() => {
            setEditing(null);
            setDialogOpen(true);
          }}
        >
          Add target
        </Button>
      }
    >
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Target</TableCell>
            <TableCell>Scope</TableCell>
            <TableCell sx={{ width: "30%" }}>Progress to target</TableCell>
            <TableCell align="right">Current vs target</TableCell>
            <TableCell>Status</TableCell>
            <TableCell align="right">Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {(targets ?? []).map((target) => {
            const item = progressById.get(target.id);
            const pct = item ? Math.min(Math.max(item.pctToTarget, 0), 100) : 0;
            return (
              <TableRow key={target.id} hover>
                <TableCell>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {target.name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {target.owner} · baseline {target.baseYear}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Chip size="small" variant="outlined" label={`Scope ${target.scope}`} />
                </TableCell>
                <TableCell>
                  <Stack spacing={0.5}>
                    <Stack direction="row" sx={{ justifyContent: "space-between" }}>
                      <Typography variant="caption">
                        {item ? formatPercent(item.pctToTarget, 0) : "—"}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {target.targetYear}
                      </Typography>
                    </Stack>
                    <LinearProgress
                      variant="determinate"
                      value={pct}
                      sx={{ height: 7, borderRadius: 4 }}
                    />
                  </Stack>
                </TableCell>
                <TableCell align="right" sx={{ whiteSpace: "nowrap" }}>
                  {item ? formatTonnes(item.currentTonnes) : "—"} / {formatTonnes(target.targetTonnes)} t
                  <Typography variant="caption" color="text.secondary" sx={{ display: "block" }}>
                    project {item ? formatTonnes(item.projectionTonnes) : "—"} t
                    {item ? (item.onTrack ? " · on track" : " · off track") : ""}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Chip
                    size="small"
                    label={target.status.replace("_", " ")}
                    color={STATUS_COLOR[target.status]}
                    variant="outlined"
                  />
                </TableCell>
                <TableCell align="right">
                  <Stack direction="row" spacing={0.5} sx={{ justifyContent: "flex-end" }}>
                    <Button
                      size="small"
                      onClick={() => {
                        setEditing(target);
                        setDialogOpen(true);
                      }}
                    >
                      Edit
                    </Button>
                    <Button
                      size="small"
                      color="inherit"
                      onClick={() => {
                        if (window.confirm(`Delete target "${target.name}"?`)) {
                          void deleteTarget(target.id);
                        }
                      }}
                    >
                      Delete
                    </Button>
                  </Stack>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
      <TargetDialog open={dialogOpen} target={editing} onClose={() => setDialogOpen(false)} />
    </SectionCard>
  );
}
