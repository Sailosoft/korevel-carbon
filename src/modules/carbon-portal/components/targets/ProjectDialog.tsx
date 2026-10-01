"use client";

import { useState } from "react";
import Alert from "@mui/material/Alert";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import type { Project, ProjectStatus } from "../../db/types";
import { saveProject } from "../../services/records";
import { DialogShell } from "../DialogShell";
import { useDialogForm } from "../useDialogForm";
import { SelectField, type SelectOption } from "../SelectField";
import { useFacilities, useTargets } from "../../hooks/useCarbonData";

type ProjectDialogProps = {
  open: boolean;
  project: Project | null;
  onClose: () => void;
};

type FormState = {
  name: string;
  targetId: string;
  facilityId: string;
  owner: string;
  status: ProjectStatus;
  startAt: string;
  endAt: string;
  capex: string;
  expectedReductionTonnes: string;
  actualReductionTonnes: string;
  progressPct: string;
};

const STATUS_OPTIONS: SelectOption[] = [
  { value: "proposed", label: "Proposed" },
  { value: "in_progress", label: "In progress" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
];

function buildForm(project: Project | null): FormState {
  if (project) {
    return {
      name: project.name,
      targetId: project.targetId ?? "",
      facilityId: project.facilityId ?? "",
      owner: project.owner,
      status: project.status,
      startAt: project.startAt,
      endAt: project.endAt ?? "",
      capex: String(project.capex),
      expectedReductionTonnes: String(project.expectedReductionTonnes),
      actualReductionTonnes: String(project.actualReductionTonnes),
      progressPct: String(project.progressPct),
    };
  }
  return {
    name: "",
    targetId: "",
    facilityId: "",
    owner: "",
    status: "proposed",
    startAt: new Date().toISOString().slice(0, 10),
    endAt: "",
    capex: "",
    expectedReductionTonnes: "",
    actualReductionTonnes: "0",
    progressPct: "0",
  };
}

export function ProjectDialog({ open, project, onClose }: ProjectDialogProps) {
  const targets = useTargets();
  const facilities = useFacilities();
  const [saving, setSaving] = useState(false);
  const { form, setForm, error, setError } = useDialogForm<FormState, Project | null>(
    open,
    project,
    buildForm,
  );

  const capex = Number(form.capex);
  const expected = Number(form.expectedReductionTonnes);
  const actual = Number(form.actualReductionTonnes);
  const progress = Number(form.progressPct);
  const valid =
    form.name.trim() !== "" &&
    form.startAt !== "" &&
    Number.isFinite(capex) &&
    capex >= 0 &&
    Number.isFinite(expected) &&
    Number.isFinite(actual) &&
    Number.isFinite(progress) &&
    progress >= 0 &&
    progress <= 100 &&
    !saving;

  const handleSave = async () => {
    if (!valid) return;
    setSaving(true);
    setError(null);
    try {
      await saveProject({
        id: project?.id ?? `prj-${crypto.randomUUID()}`,
        name: form.name.trim(),
        targetId: form.targetId === "" ? null : form.targetId,
        facilityId: form.facilityId === "" ? null : form.facilityId,
        owner: form.owner.trim() || "Unassigned",
        status: form.status,
        startAt: form.startAt,
        endAt: form.endAt === "" ? null : form.endAt,
        capex,
        expectedReductionTonnes: expected,
        actualReductionTonnes: actual,
        progressPct: progress,
      });
      onClose();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : String(cause));
    } finally {
      setSaving(false);
    }
  };

  return (
    <DialogShell
      open={open}
      title={project ? "Edit project" : "Add project"}
      onClose={onClose}
      onSave={handleSave}
      saving={saving}
      saveLabel={project ? "Save changes" : "Create project"}
    >
      {error ? <Alert severity="error">{error}</Alert> : null}
      <TextField
        label="Project name"
        size="small"
        fullWidth
        value={form.name}
        onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
        required
      />
      <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
        <SelectField
          label="Linked target"
          value={form.targetId}
          onChange={(targetId) => setForm((prev) => ({ ...prev, targetId }))}
          options={(targets ?? []).map((target) => ({ value: target.id, label: target.name }))}
          emptyLabel="No target"
        />
        <SelectField
          label="Facility"
          value={form.facilityId}
          onChange={(facilityId) => setForm((prev) => ({ ...prev, facilityId }))}
          options={(facilities ?? []).map((facility) => ({
            value: facility.id,
            label: facility.name,
          }))}
          emptyLabel="Company-wide"
        />
      </Stack>
      <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
        <SelectField
          label="Status"
          value={form.status}
          onChange={(status) =>
            setForm((prev) => ({ ...prev, status: status as ProjectStatus }))
          }
          options={STATUS_OPTIONS}
        />
        <TextField
          label="Owner"
          size="small"
          fullWidth
          value={form.owner}
          onChange={(event) => setForm((prev) => ({ ...prev, owner: event.target.value }))}
        />
      </Stack>
      <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
        <TextField
          label="Start date"
          type="date"
          size="small"
          fullWidth
          value={form.startAt}
          onChange={(event) => setForm((prev) => ({ ...prev, startAt: event.target.value }))}
          slotProps={{ inputLabel: { shrink: true } }}
          required
        />
        <TextField
          label="End date"
          type="date"
          size="small"
          fullWidth
          value={form.endAt}
          onChange={(event) => setForm((prev) => ({ ...prev, endAt: event.target.value }))}
          slotProps={{ inputLabel: { shrink: true } }}
        />
      </Stack>
      <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
        <TextField
          label="Capex (EUR)"
          type="number"
          size="small"
          fullWidth
          value={form.capex}
          onChange={(event) => setForm((prev) => ({ ...prev, capex: event.target.value }))}
          slotProps={{ htmlInput: { min: 0, step: "any" } }}
        />
        <TextField
          label="Progress (%)"
          type="number"
          size="small"
          fullWidth
          value={form.progressPct}
          onChange={(event) => setForm((prev) => ({ ...prev, progressPct: event.target.value }))}
          slotProps={{ htmlInput: { min: 0, max: 100, step: 1 } }}
        />
      </Stack>
      <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
        <TextField
          label="Expected reduction (t/yr)"
          type="number"
          size="small"
          fullWidth
          value={form.expectedReductionTonnes}
          onChange={(event) =>
            setForm((prev) => ({ ...prev, expectedReductionTonnes: event.target.value }))
          }
          slotProps={{ htmlInput: { min: 0, step: "any" } }}
        />
        <TextField
          label="Actual reduction (t/yr)"
          type="number"
          size="small"
          fullWidth
          value={form.actualReductionTonnes}
          onChange={(event) =>
            setForm((prev) => ({ ...prev, actualReductionTonnes: event.target.value }))
          }
          slotProps={{ htmlInput: { min: 0, step: "any" } }}
        />
      </Stack>
    </DialogShell>
  );
}
