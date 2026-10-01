"use client";

import { useState } from "react";
import Alert from "@mui/material/Alert";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import type { EmissionFactor, FactorSource, GwpSet, Scope } from "../../db/types";
import { saveFactor } from "../../services/records";
import { DialogShell } from "../DialogShell";
import { useDialogForm } from "../useDialogForm";
import { SelectField, type SelectOption } from "../SelectField";

type FactorDialogProps = {
  open: boolean;
  factor: EmissionFactor | null;
  onClose: () => void;
};

type FormState = {
  key: string;
  scope: string;
  category: string;
  activity: string;
  unit: string;
  co2ePerUnit: string;
  gwpSet: GwpSet;
  source: FactorSource;
  vintageYear: string;
  region: string;
};

const SCOPE_OPTIONS: SelectOption[] = [
  { value: "1", label: "Scope 1" },
  { value: "2", label: "Scope 2" },
  { value: "3", label: "Scope 3" },
];

const GWP_OPTIONS: SelectOption[] = ["AR4", "AR5", "AR6"].map((set) => ({
  value: set,
  label: set,
}));

const SOURCE_OPTIONS: SelectOption[] = ["DEFRA", "EPA", "IPCC", "IEA", "EXIOBASE"].map(
  (source) => ({ value: source, label: source }),
);

function buildForm(factor: EmissionFactor | null): FormState {
  if (factor) {
    return {
      key: factor.key,
      scope: String(factor.scope),
      category: factor.category,
      activity: factor.activity,
      unit: factor.unit,
      co2ePerUnit: String(factor.co2ePerUnit),
      gwpSet: factor.gwpSet,
      source: factor.source,
      vintageYear: String(factor.vintageYear),
      region: factor.region ?? "",
    };
  }
  return {
    key: "",
    scope: "1",
    category: "",
    activity: "",
    unit: "",
    co2ePerUnit: "",
    gwpSet: "AR5",
    source: "DEFRA",
    vintageYear: "2024",
    region: "",
  };
}

export function FactorDialog({ open, factor, onClose }: FactorDialogProps) {
  const [saving, setSaving] = useState(false);
  const { form, setForm, error, setError } = useDialogForm<FormState, EmissionFactor | null>(
    open,
    factor,
    buildForm,
  );

  const co2ePerUnit = Number(form.co2ePerUnit);
  const vintageYear = Number(form.vintageYear);
  const valid =
    form.key.trim() !== "" &&
    form.category.trim() !== "" &&
    form.activity.trim() !== "" &&
    form.unit.trim() !== "" &&
    Number.isFinite(co2ePerUnit) &&
    co2ePerUnit > 0 &&
    Number.isFinite(vintageYear) &&
    !saving;

  const handleSave = async () => {
    if (!valid) return;
    setSaving(true);
    setError(null);
    try {
      await saveFactor({
        id: factor?.id ?? `ef-${form.key.trim()}`,
        key: form.key.trim(),
        scope: Number(form.scope) as Scope,
        category: form.category.trim(),
        activity: form.activity.trim(),
        unit: form.unit.trim(),
        co2ePerUnit,
        gwpSet: form.gwpSet,
        source: form.source,
        vintageYear,
        region: form.region.trim() === "" ? null : form.region.trim().toUpperCase(),
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
      title={factor ? "Edit emission factor" : "Add emission factor"}
      onClose={onClose}
      onSave={handleSave}
      saving={saving}
      saveLabel={factor ? "Save changes" : "Create factor"}
    >
      {error ? <Alert severity="error">{error}</Alert> : null}
      <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
        <TextField
          label="Factor key"
          size="small"
          fullWidth
          value={form.key}
          onChange={(event) => setForm((prev) => ({ ...prev, key: event.target.value }))}
          placeholder="diesel-stationary"
          required
        />
        <SelectField
          label="Scope"
          value={form.scope}
          onChange={(scope) => setForm((prev) => ({ ...prev, scope }))}
          options={SCOPE_OPTIONS}
          required
        />
      </Stack>
      <TextField
        label="Activity name"
        size="small"
        fullWidth
        value={form.activity}
        onChange={(event) => setForm((prev) => ({ ...prev, activity: event.target.value }))}
        placeholder="Diesel (stationary)"
        required
      />
      <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
        <TextField
          label="GHG category"
          size="small"
          fullWidth
          value={form.category}
          onChange={(event) => setForm((prev) => ({ ...prev, category: event.target.value }))}
          placeholder="fuel-combustion"
          required
        />
        <TextField
          label="Unit"
          size="small"
          sx={{ maxWidth: { sm: 160 } }}
          value={form.unit}
          onChange={(event) => setForm((prev) => ({ ...prev, unit: event.target.value }))}
          placeholder="litre"
          required
        />
      </Stack>
      <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
        <TextField
          label="kg CO2e per unit"
          type="number"
          size="small"
          fullWidth
          value={form.co2ePerUnit}
          onChange={(event) => setForm((prev) => ({ ...prev, co2ePerUnit: event.target.value }))}
          slotProps={{ htmlInput: { min: 0, step: "any" } }}
          required
        />
        <SelectField
          label="GWP set"
          value={form.gwpSet}
          onChange={(gwpSet) => setForm((prev) => ({ ...prev, gwpSet: gwpSet as GwpSet }))}
          options={GWP_OPTIONS}
        />
      </Stack>
      <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
        <SelectField
          label="Source"
          value={form.source}
          onChange={(source) => setForm((prev) => ({ ...prev, source: source as FactorSource }))}
          options={SOURCE_OPTIONS}
        />
        <TextField
          label="Vintage year"
          type="number"
          size="small"
          sx={{ maxWidth: { sm: 160 } }}
          value={form.vintageYear}
          onChange={(event) => setForm((prev) => ({ ...prev, vintageYear: event.target.value }))}
          slotProps={{ htmlInput: { min: 1990, max: 2100 } }}
        />
        <TextField
          label="Region (optional)"
          size="small"
          sx={{ maxWidth: { sm: 160 } }}
          value={form.region}
          onChange={(event) => setForm((prev) => ({ ...prev, region: event.target.value }))}
          placeholder="NL"
          helperText="Empty = global"
        />
      </Stack>
    </DialogShell>
  );
}
