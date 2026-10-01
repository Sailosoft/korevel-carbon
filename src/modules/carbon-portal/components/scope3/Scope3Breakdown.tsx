"use client";

import { useMemo, useState } from "react";
import Button from "@mui/material/Button";
import LinearProgress from "@mui/material/LinearProgress";
import Stack from "@mui/material/Stack";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Typography from "@mui/material/Typography";
import type { Activity } from "../../db/types";
import { useEmissionRows, type EmissionRow } from "../../hooks/useCarbonData";
import { formatMonth } from "../../lib/months";
import { formatPercent, formatQuantity, formatTonnes } from "../../lib/format";
import { ActivityDialog } from "../ActivityDialog";
import { SectionCard } from "../SectionCard";
import { QualityChip } from "../chips";

export function Scope3Breakdown() {
  const rows = useEmissionRows();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Activity | null>(null);

  const scope3Rows = useMemo(
    () => (rows ?? []).filter((row) => row.scope === 3),
    [rows],
  );

  const byCategory = useMemo(() => {
    const totals = new Map<string, number>();
    for (const row of scope3Rows) {
      totals.set(row.category, (totals.get(row.category) ?? 0) + row.co2eTonnes);
    }
    return Array.from(totals, ([category, tonnes]) => ({ category, tonnes })).sort(
      (a, b) => b.tonnes - a.tonnes,
    );
  }, [scope3Rows]);

  const categoryTotal = byCategory.reduce((sum, item) => sum + item.tonnes, 0);

  const handleEdit = (row: EmissionRow) => {
    setEditing(row.activity);
    setDialogOpen(true);
  };

  return (
    <SectionCard
      title="Scope 3 breakdown"
      subtitle="Category split and the underlying activities"
      actions={
        <Button
          size="small"
          variant="outlined"
          onClick={() => {
            setEditing(null);
            setDialogOpen(true);
          }}
        >
          Add scope 3 activity
        </Button>
      }
    >
      <Stack spacing={1}>
        {byCategory.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            No scope 3 activities yet.
          </Typography>
        ) : (
          byCategory.map((item) => (
            <Stack key={item.category} spacing={0.5}>
              <Stack
                direction="row"
                spacing={1}
                sx={{ justifyContent: "space-between", alignItems: "baseline" }}
              >
                <Typography variant="body2">{item.category}</Typography>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {formatTonnes(item.tonnes)} t · {formatPercent((item.tonnes / categoryTotal) * 100, 1)}
                </Typography>
              </Stack>
              <LinearProgress
                variant="determinate"
                value={Math.min((item.tonnes / Math.max(categoryTotal, 1)) * 100, 100)}
                sx={{ height: 6, borderRadius: 3 }}
              />
            </Stack>
          ))
        )}
      </Stack>
      <TableContainer sx={{ maxHeight: 340 }}>
        <Table size="small" stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell>Month</TableCell>
              <TableCell>Facility</TableCell>
              <TableCell>Source</TableCell>
              <TableCell align="right">Quantity</TableCell>
              <TableCell align="right">t CO2e</TableCell>
              <TableCell>Supplier</TableCell>
              <TableCell>Quality</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {scope3Rows.map((row) => (
              <TableRow key={row.id} hover>
                <TableCell>{formatMonth(row.date)}</TableCell>
                <TableCell>{row.facilityName}</TableCell>
                <TableCell>{row.sourceLabel}</TableCell>
                <TableCell align="right" sx={{ whiteSpace: "nowrap" }}>
                  {formatQuantity(row.quantity)} {row.unit}
                </TableCell>
                <TableCell align="right" sx={{ whiteSpace: "nowrap", fontWeight: 600 }}>
                  {formatTonnes(row.co2eTonnes, 2)}
                </TableCell>
                <TableCell>{row.supplierName ?? "—"}</TableCell>
                <TableCell>
                  <QualityChip quality={row.dataQuality} />
                </TableCell>
                <TableCell align="right">
                  <Button size="small" onClick={() => handleEdit(row)}>
                    Edit
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <ActivityDialog
        open={dialogOpen}
        activity={editing}
        defaultScope={3}
        onClose={() => setDialogOpen(false)}
      />
    </SectionCard>
  );
}
