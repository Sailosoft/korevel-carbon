"use client";

import { useState } from "react";
import Alert from "@mui/material/Alert";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import type { Target, TargetScope, TargetStatus } from "../../db/types";
import { saveTarget } from "../../services/records";
import { DialogShell } from "../DialogShell";
import { useDialogForm } from "../useDialogForm";
import { SelectField, type SelectOption } from "../SelectField";

type TargetDialogProps = {
  open: boolean;
  target: Target | null;
  onClose: () => void;
};

type FormState = {
  name: string;
  scope: TargetScope;
  baseYear: string;
  baselineTonnes: string;
  targetYear: string;
  targetTonnes: string;
  status: TargetStatus;
  owner: string;
};

const SCOPE_OPTIONS: SelectOption[] = ["1", "2", "3", "1+2", "1+2+3"].map((scope) => ({
  value: scope,
  label: `Scope ${scope}`,
}));

const STATUS_OPTIONS: SelectOption[] = [
  { value: "draft", label: "Draft" },
  { value: "committed", label: "Committed" },
  { value: "achieved", label: "Achieved" },
  { value: "at_risk", label: "At risk" },
];

function buildForm(target: Target | null): FormState {
  if (target) {
    return {
      name: target.name,
      scope: target.scope,
      baseYear: String(target.baseYear),
      baselineTonnes: String(target.baselineTonnes),
      targetYear: String(target.targetYear),
      targetTonnes: String(target.targetTonnes),
      status: target.status,
      owner: target.owner,
    };
  }
  return {
    name: "",
    scope: "1+2",
    baseYear: "2024",
    baselineTonnes: "",
    targetYear: "2030",
    targetTonnes: "",
    status: "draft",
    owner: "",
  };
}

export function TargetDialog({ open, target, onClose }: TargetDialogProps) {
  const [saving, setSaving] = useState(false);
  const { form, setForm, error, setError } = useDialogForm<FormState, Target | null>(
    open,
    target,
    buildForm,
  );

  const baseline = Number(form.baselineTonnes);
  const targetTonnes = Number(form.targetTonnes);
  const baseYear = Number(form.baseYear);
  const targetYear = Number(form.targetYear);
  const valid =
    form.name.trim() !== "" &&
    Number.isFinite(baseline) &&
    baseline >= 0 &&
    Number.isFinite(targetTonnes) &&
    targetTonnes >= 0 &&
    Number.isFinite(baseYear) &&
    Number.isFinite(targetYear) &&
    targetYear > baseYear &&
    !saving;

  const handleSave = async () => {
    if (!valid) return;
    setSaving(true);
    setError(null);
    try {
      await saveTarget({
        id: target?.id ?? `tgt-${crypto.randomUUID()}`,
        name: form.name.trim(),
        scope: form.scope,
        baseYear,
        baselineTonnes: baseline,
        targetYear,
        targetTonnes,
        status: form.status,
        owner: form.owner.trim() || "Unassigned",
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
      title={target ? "Edit target" : "Add target"}
      onClose={onClose}
      onSave={handleSave}
      saving={saving}
      saveLabel={target ? "Save changes" : "Create target"}
    >
      {error ? <Alert severity="error">{error}</Alert> : null}
      <TextField
        label="Target name"
        size="small"
        fullWidth
        value={form.name}
        onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
        placeholder="Reduce scope 1+2 42% by 2030"
        required
      />
      <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
        <SelectField
          label="Scope"
          value={form.scope}
          onChange={(scope) => setForm((prev) => ({ ...prev, scope: scope as TargetScope }))}
          options={SCOPE_OPTIONS}
        />
        <SelectField
          label="Status"
          value={form.status}
          onChange={(status) =>
            setForm((prev) => ({ ...prev, status: status as TargetStatus }))
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
          label="Base year"
          type="number"
          size="small"
          fullWidth
          value={form.baseYear}
          onChange={(event) => setForm((prev) => ({ ...prev, baseYear: event.target.value }))}
          slotProps={{ htmlInput: { min: 1990, max: 2100 } }}
          required
        />
        <TextField
          label="Baseline (t CO2e)"
          type="number"
          size="small"
          fullWidth
          value={form.baselineTonnes}
          onChange={(event) =>
            setForm((prev) => ({ ...prev, baselineTonnes: event.target.value }))
          }
          slotProps={{ htmlInput: { min: 0, step: "any" } }}
          required
        />
      </Stack>
      <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
        <TextField
          label="Target year"
          type="number"
          size="small"
          fullWidth
          value={form.targetYear}
          onChange={(event) => setForm((prev) => ({ ...prev, targetYear: event.target.value }))}
          slotProps={{ htmlInput: { min: 1990, max: 2100 } }}
          required
        />
        <TextField
          label="Target (t CO2e)"
          type="number"
          size="small"
          fullWidth
          value={form.targetTonnes}
          onChange={(event) => setForm((prev) => ({ ...prev, targetTonnes: event.target.value }))}
          slotProps={{ htmlInput: { min: 0, step: "any" } }}
          required
        />
      </Stack>
      {valid ? (
        <Alert severity="info" variant="outlined">
          Required reduction: {formatReduction(baseline, targetTonnes)} (
          {(((baseline - targetTonnes) / baseline) * 100 || 0).toFixed(1)}% from baseline)
        </Alert>
      ) : null}
    </DialogShell>
  );
}

function formatReduction(baseline: number, targetTonnes: number): string {
  const delta = baseline - targetTonnes;
  return `${Math.round(delta).toLocaleString("en-GB")} t CO2e`;
}
