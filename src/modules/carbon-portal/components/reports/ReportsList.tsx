"use client";

import { useState } from "react";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Grid from "@mui/material/Grid";
import Skeleton from "@mui/material/Skeleton";
import Stack from "@mui/material/Stack";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Typography from "@mui/material/Typography";
import type { ReportStatus } from "../../db/types";
import { useOverviewKpis, useReports } from "../../hooks/useCarbonData";
import { formatTonnes } from "../../lib/format";
import { formatMonth } from "../../lib/months";
import { deleteReport, setReportStatus } from "../../services/reporting";
import { SCOPE_COLORS } from "../../theme";
import { MetricCard } from "../MetricCard";
import { PortalPageHeader } from "../PortalPageHeader";
import { SectionCard } from "../SectionCard";
import { GenerateReportDialog } from "./GenerateReportDialog";

const STATUS_COLOR: Record<ReportStatus, "default" | "primary" | "success"> = {
  draft: "default",
  in_review: "primary",
  published: "success",
};

function toLocalDate(iso: string): string {
  return iso.slice(0, 10);
}

export function ReportsList() {
  const reports = useReports();
  const kpis = useOverviewKpis();
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <Stack spacing={3}>
      <PortalPageHeader
        title="Reports"
        subtitle="Frozen period snapshots for CSRD-style reporting, generated from live aggregates."
        actions={
          <Button variant="contained" onClick={() => setDialogOpen(true)}>
            Generate report
          </Button>
        }
      />
      <Grid container spacing={2}>
        {kpis ? (
          <>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <MetricCard
                label="Current inventory"
                value={`${formatTonnes(kpis.totalTonnes)} t`}
                caption={
                  <Typography variant="caption" color="text.secondary">
                    Rolling 12-month total
                  </Typography>
                }
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <MetricCard
                label="Scope 1"
                value={`${formatTonnes(kpis.scope1)} t`}
                accent={SCOPE_COLORS[1]}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <MetricCard
                label="Scope 2"
                value={`${formatTonnes(kpis.scope2)} t`}
                accent={SCOPE_COLORS[2]}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <MetricCard
                label="Scope 3"
                value={`${formatTonnes(kpis.scope3)} t`}
                accent={SCOPE_COLORS[3]}
              />
            </Grid>
          </>
        ) : (
          Array.from({ length: 4 }, (_, index) => (
            <Grid key={index} size={{ xs: 12, sm: 6, md: 3 }}>
              <Skeleton variant="rounded" height={108} />
            </Grid>
          ))
        )}
      </Grid>
      <SectionCard title="Inventory reports" subtitle="Draft, in review and published snapshots">
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Report</TableCell>
              <TableCell>Period</TableCell>
              <TableCell align="right">Total</TableCell>
              <TableCell align="right">Scope 1</TableCell>
              <TableCell align="right">Scope 2</TableCell>
              <TableCell align="right">Scope 3</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {(reports ?? []).map((report) => (
              <TableRow key={report.id} hover>
                <TableCell>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {report.title}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    generated {toLocalDate(report.generatedAt)}
                    {report.publishedAt ? ` · published ${toLocalDate(report.publishedAt)}` : ""}
                  </Typography>
                </TableCell>
                <TableCell sx={{ whiteSpace: "nowrap" }}>
                  {formatMonth(report.periodStart)} – {formatMonth(report.periodEnd)}
                </TableCell>
                <TableCell align="right" sx={{ whiteSpace: "nowrap", fontWeight: 600 }}>
                  {formatTonnes(report.totalTonnes, 1)} t
                </TableCell>
                <TableCell align="right">{formatTonnes(report.scope1Tonnes, 1)}</TableCell>
                <TableCell align="right">{formatTonnes(report.scope2Tonnes, 1)}</TableCell>
                <TableCell align="right">{formatTonnes(report.scope3Tonnes, 1)}</TableCell>
                <TableCell>
                  <Chip
                    size="small"
                    label={report.status.replace("_", " ")}
                    color={STATUS_COLOR[report.status]}
                    variant="outlined"
                  />
                </TableCell>
                <TableCell align="right">
                  <Stack direction="row" spacing={0.5} sx={{ justifyContent: "flex-end" }}>
                    {report.status === "draft" ? (
                      <Button
                        size="small"
                        onClick={() => void setReportStatus(report.id, "in_review")}
                      >
                        Send for review
                      </Button>
                    ) : null}
                    {report.status === "in_review" ? (
                      <>
                        <Button
                          size="small"
                          variant="contained"
                          onClick={() => void setReportStatus(report.id, "published")}
                        >
                          Publish
                        </Button>
                        <Button
                          size="small"
                          color="inherit"
                          onClick={() => void setReportStatus(report.id, "draft")}
                        >
                          Back
                        </Button>
                      </>
                    ) : null}
                    {report.status !== "published" ? (
                      <Button
                        size="small"
                        color="inherit"
                        onClick={() => {
                          if (window.confirm(`Delete report "${report.title}"?`)) {
                            void deleteReport(report.id);
                          }
                        }}
                      >
                        Delete
                      </Button>
                    ) : null}
                  </Stack>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {reports && reports.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            No reports yet. Generate your first snapshot.
          </Typography>
        ) : null}
      </SectionCard>
      <GenerateReportDialog open={dialogOpen} onClose={() => setDialogOpen(false)} />
    </Stack>
  );
}
