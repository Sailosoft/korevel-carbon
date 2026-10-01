"use client";

import { useMemo, useState } from "react";
import Alert from "@mui/material/Alert";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import {
  ACTIVITY_SOURCE_TYPES,
  SOURCE_TYPE_META,
} from "../db/sourceTypes";
import type { Activity, ActivitySourceType, DataQuality, Scope } from "../db/types";
import { useEmissionFactors, useFacilities, useSuppliers } from "../hooks/useCarbonData";
import { formatQuantity, formatTonnes } from "../lib/format";
import { MONTH_OPTIONS, formatMonth } from "../lib/months";
import { matchFactor } from "../services/calculateEmissions";
import { saveActivity } from "../services/records";
import { DialogShell } from "./DialogShell";
import { SelectField, type SelectOption } from "./SelectField";
import { ScopeChip } from "./chips";
import { useDialogForm } from "./useDialogForm";

type ActivityDialogProps = {
  open: boolean;
  activity: Activity | null;
  defaultFacilityId?: string;
  defaultScope?: Scope;
  onClose: () => void;
};

type FormState = {
  facilityId: string;
  date: string;
  sourceType: ActivitySourceType;
  quantity: string;
  dataQuality: DataQuality;
  supplierId: string;
  notes: string;
};

const LAST_SEED_MONTH = "2026-09";

const QUALITY_OPTIONS: SelectOption[] = [
  { value: "primary", label: "Primary (metered/supplier data)" },
  { value: "secondary", label: "Secondary (industry averages)" },
  { value: "spend_based", label: "Spend-based" },
];

function buildForm(activity: Activity | null): FormState {
  if (activity) {
    return {
      facilityId: activity.facilityId,
      date: activity.date,
      sourceType: activity.sourceType,
      quantity: String(activity.quantity),
      dataQuality: activity.dataQuality,
      supplierId: activity.supplierId ?? "",
      notes: activity.notes ?? "",
    };
  }
  return {
    facilityId: "",
    date: LAST_SEED_MONTH,
    sourceType: "electricity_grid",
    quantity: "",
    dataQuality: "primary",
    supplierId: "",
    notes: "",
  };
}

export function ActivityDialog({
  open,
  activity,
  defaultFacilityId,
  defaultScope,
  onClose,
}: ActivityDialogProps) {
  const facilities = useFacilities();
  const factors = useEmissionFactors();
  const suppliers = useSuppliers();
  const [saving, setSaving] = useState(false);
  const { form, setForm, error, setError } = useDialogForm<FormState, Activity | null>(
    open,
    activity,
    (record) => {
      const next = buildForm(record);
      if (defaultFacilityId) next.facilityId = defaultFacilityId;
      if (defaultScope) {
        const scoped = ACTIVITY_SOURCE_TYPES.filter(
          (source) => SOURCE_TYPE_META[source].scope === defaultScope,
        );
        if (!scoped.includes(next.sourceType) && scoped.length > 0) {
          next.sourceType = scoped[0];
        }
      }
      return next;
    },
  );

  const sourceOptions: SelectOption[] = useMemo(() => {
    const sources = defaultScope
      ? ACTIVITY_SOURCE_TYPES.filter((source) => SOURCE_TYPE_META[source].scope === defaultScope)
      : ACTIVITY_SOURCE_TYPES;
    return sources.map((source) => ({
      value: source,
      label: SOURCE_TYPE_META[source].label,
    }));
  }, [defaultScope]);

  const meta = SOURCE_TYPE_META[form.sourceType];
  const facility = facilities?.find((item) => item.id === form.facilityId);
  const previewFactor = useMemo(() => {
    if (!factors) return undefined;
    return matchFactor(
      {
        activity: {
          sourceType: form.sourceType,
          category: meta.category,
          unit: meta.unit,
          scope: meta.scope,
        },
        facility,
      },
      factors,
    );
  }, [factors, form.sourceType, meta.category, meta.unit, meta.scope, facility]);

  const quantity = Number(form.quantity);
  const previewTonnes =
    previewFactor && Number.isFinite(quantity)
      ? (quantity * previewFactor.co2ePerUnit) / 1000
      : null;
  const valid =
    form.facilityId !== "" &&
    form.date !== "" &&
    Number.isFinite(quantity) &&
    quantity > 0 &&
    !saving;

  const handleSave = async () => {
    if (!valid) return;
    setSaving(true);
    setError(null);
    try {
      await saveActivity({
        id: activity?.id,
        facilityId: form.facilityId,
        date: form.date,
        sourceType: form.sourceType,
        quantity,
        dataQuality: form.dataQuality,
        supplierId: form.supplierId === "" ? null : form.supplierId,
        notes: form.notes.trim() === "" ? null : form.notes.trim(),
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
      title={activity ? "Edit activity" : "Add activity"}
      onClose={onClose}
      onSave={handleSave}
      saving={saving}
      saveLabel={activity ? "Save changes" : "Create activity"}
    >
      {error ? <Alert severity="error">{error}</Alert> : null}
      <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
        <Typography variant="caption" color="text.secondary">
          Scope
        </Typography>
        <ScopeChip scope={meta.scope} />
        <Typography variant="caption" color="text.secondary">
          {meta.category} · unit: {meta.unit}
        </Typography>
      </Stack>
      <SelectField
        label="Facility"
        value={form.facilityId}
        onChange={(facilityId) => setForm((prev) => ({ ...prev, facilityId }))}
        options={(facilities ?? []).map((item) => ({
          value: item.id,
          label: `${item.name} (${item.code})`,
        }))}
        emptyLabel="Select a facility"
        required
      />
      <SelectField
        label="Month"
        value={form.date}
        onChange={(date) => setForm((prev) => ({ ...prev, date }))}
        options={MONTH_OPTIONS.map((month) => ({
          value: month,
          label: formatMonth(month),
        }))}
        required
      />
      <SelectField
        label="Source"
        value={form.sourceType}
        onChange={(sourceType) =>
          setForm((prev) => ({
            ...prev,
            sourceType: sourceType as ActivitySourceType,
            supplierId: "",
          }))
        }
        options={sourceOptions}
        required
      />
      <TextField
        label={`Quantity (${meta.unit})`}
        type="number"
        size="small"
        fullWidth
        value={form.quantity}
        onChange={(event) => setForm((prev) => ({ ...prev, quantity: event.target.value }))}
        slotProps={{ htmlInput: { min: 0, step: "any" } }}
        required
      />
      <SelectField
        label="Data quality"
        value={form.dataQuality}
        onChange={(dataQuality) =>
          setForm((prev) => ({ ...prev, dataQuality: dataQuality as DataQuality }))
        }
        options={QUALITY_OPTIONS}
        required
      />
      {meta.supportsSupplier ? (
        <SelectField
          label="Supplier"
          value={form.supplierId}
          onChange={(supplierId) => setForm((prev) => ({ ...prev, supplierId }))}
          options={(suppliers ?? []).map((item) => ({
            value: item.id,
            label: item.name,
          }))}
          emptyLabel="No supplier attribution"
        />
      ) : null}
      <TextField
        label="Notes"
        size="small"
        fullWidth
        multiline
        minRows={2}
        value={form.notes}
        onChange={(event) => setForm((prev) => ({ ...prev, notes: event.target.value }))}
      />
      {previewFactor ? (
        <Alert severity="info" variant="outlined">
          Factor: {previewFactor.activity} ({previewFactor.source} {previewFactor.vintageYear}) ={" "}
          {formatQuantity(previewFactor.co2ePerUnit)} kg CO2e/{previewFactor.unit}
          {previewTonnes !== null ? ` ≈ ${formatTonnes(previewTonnes, 3)} t CO2e` : null}
        </Alert>
      ) : (
        <Alert severity="warning" variant="outlined">
          No emission factor matches this source, category and unit. Emissions will not be
          calculated until a matching factor exists.
        </Alert>
      )}
    </DialogShell>
  );
}
