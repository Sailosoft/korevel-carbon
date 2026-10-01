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
import type { Project, ProjectStatus } from "../../db/types";
import { useFacilities, useProjects } from "../../hooks/useCarbonData";
import { formatCurrency, formatPercent, formatTonnes } from "../../lib/format";
import { deleteProject } from "../../services/records";
import { SectionCard } from "../SectionCard";
import { ProjectDialog } from "./ProjectDialog";

const STATUS_COLOR: Record<ProjectStatus, "default" | "primary" | "success" | "error"> = {
  proposed: "default",
  in_progress: "primary",
  completed: "success",
  cancelled: "error",
};

export function ProjectsPanel() {
  const projects = useProjects();
  const facilities = useFacilities();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Project | null>(null);

  const facilityName = (facilityId: string | null) =>
    facilityId ? (facilities?.find((facility) => facility.id === facilityId)?.name ?? facilityId) : "Company-wide";

  return (
    <SectionCard
      title="Projects"
      subtitle="Reduction initiatives delivering against the targets"
      actions={
        <Button
          size="small"
          variant="outlined"
          onClick={() => {
            setEditing(null);
            setDialogOpen(true);
          }}
        >
          Add project
        </Button>
      }
    >
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Project</TableCell>
            <TableCell>Facility</TableCell>
            <TableCell sx={{ width: "24%" }}>Progress</TableCell>
            <TableCell align="right">Reduction (t/yr)</TableCell>
            <TableCell align="right">Capex</TableCell>
            <TableCell>Status</TableCell>
            <TableCell align="right">Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {(projects ?? []).map((project) => (
            <TableRow key={project.id} hover>
              <TableCell>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {project.name}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {project.owner} · started {project.startAt}
                </Typography>
              </TableCell>
              <TableCell>{facilityName(project.facilityId)}</TableCell>
              <TableCell>
                <Stack spacing={0.5}>
                  <Typography variant="caption">{formatPercent(project.progressPct, 0)}</Typography>
                  <LinearProgress
                    variant="determinate"
                    value={project.progressPct}
                    sx={{ height: 7, borderRadius: 4 }}
                  />
                </Stack>
              </TableCell>
              <TableCell align="right" sx={{ whiteSpace: "nowrap" }}>
                {formatTonnes(project.actualReductionTonnes)} / {formatTonnes(project.expectedReductionTonnes)}
              </TableCell>
              <TableCell align="right" sx={{ whiteSpace: "nowrap" }}>
                {formatCurrency(project.capex)}
              </TableCell>
              <TableCell>
                <Chip
                  size="small"
                  label={project.status.replace("_", " ")}
                  color={STATUS_COLOR[project.status]}
                  variant="outlined"
                />
              </TableCell>
              <TableCell align="right">
                <Stack direction="row" spacing={0.5} sx={{ justifyContent: "flex-end" }}>
                  <Button
                    size="small"
                    onClick={() => {
                      setEditing(project);
                      setDialogOpen(true);
                    }}
                  >
                    Edit
                  </Button>
                  <Button
                    size="small"
                    color="inherit"
                    onClick={() => {
                      if (window.confirm(`Delete project "${project.name}"?`)) {
                        void deleteProject(project.id);
                      }
                    }}
                  >
                    Delete
                  </Button>
                </Stack>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <ProjectDialog open={dialogOpen} project={editing} onClose={() => setDialogOpen(false)} />
    </SectionCard>
  );
}
