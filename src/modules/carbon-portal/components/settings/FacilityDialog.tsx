"use client";

import { useState } from "react";
import Alert from "@mui/material/Alert";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import type { Facility } from "../../db/types";
import { saveFacility } from "../../services/records";
import { DialogShell } from "../DialogShell";
import { useDialogForm } from "../useDialogForm";
import { SelectField } from "../SelectField";

type FacilityDialogProps = {
  open: boolean;
  facility: Facility | null;
  onClose: () => void;
};

type FormState = {
  code: string;
  name: string;
  city: string;
  country: string;
  sector: string;
  floorAreaM2: string;
  headcount: string;
  isActive: boolean;
  openedAt: string;
};

function buildForm(facility: Facility | null): FormState {
  if (facility) {
    return {
      code: facility.code,
      name: facility.name,
      city: facility.city,
      country: facility.country,
      sector: facility.sector,
      floorAreaM2: facility.floorAreaM2 === null ? "" : String(facility.floorAreaM2),
      headcount: facility.headcount === null ? "" : String(facility.headcount),
      isActive: facility.isActive,
      openedAt: facility.openedAt,
    };
  }
  return {
    code: "",
    name: "",
    city: "",
    country: "",
    sector: "",
    floorAreaM2: "",
    headcount: "",
    isActive: true,
    openedAt: new Date().toISOString().slice(0, 10),
  };
}

export function FacilityDialog({ open, facility, onClose }: FacilityDialogProps) {
  const [saving, setSaving] = useState(false);
  const { form, setForm, error, setError } = useDialogForm<FormState, Facility | null>(
    open,
    facility,
    buildForm,
  );

  const floorArea = form.floorAreaM2 === "" ? null : Number(form.floorAreaM2);
  const headcount = form.headcount === "" ? null : Number(form.headcount);
  const valid =
    form.code.trim() !== "" &&
    form.name.trim() !== "" &&
    form.city.trim() !== "" &&
    form.country.trim() !== "" &&
    form.openedAt !== "" &&
    (floorArea === null || (Number.isFinite(floorArea) && floorArea >= 0)) &&
    (headcount === null || Number.isFinite(headcount)) &&
    !saving;

  const handleSave = async () => {
    if (!valid) return;
    setSaving(true);
    setError(null);
    try {
      await saveFacility({
        id: facility?.id ?? `fac-${crypto.randomUUID()}`,
        code: form.code.trim().toUpperCase(),
        name: form.name.trim(),
        city: form.city.trim(),
        country: form.country.trim().toUpperCase().slice(0, 2),
        sector: form.sector.trim() || "Other",
        floorAreaM2: floorArea,
        headcount: headcount,
        isActive: form.isActive,
        openedAt: form.openedAt,
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
      title={facility ? "Edit facility" : "Add facility"}
      onClose={onClose}
      onSave={handleSave}
      saving={saving}
      saveLabel={facility ? "Save changes" : "Create facility"}
    >
      {error ? <Alert severity="error">{error}</Alert> : null}
      <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
        <TextField
          label="Code"
          size="small"
          fullWidth
          value={form.code}
          onChange={(event) => setForm((prev) => ({ ...prev, code: event.target.value }))}
          placeholder="FAC-NL-01"
          required
        />
        <TextField
          label="Name"
          size="small"
          fullWidth
          value={form.name}
          onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
          required
        />
      </Stack>
      <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
        <TextField
          label="City"
          size="small"
          fullWidth
          value={form.city}
          onChange={(event) => setForm((prev) => ({ ...prev, city: event.target.value }))}
          required
        />
        <TextField
          label="Country (ISO2)"
          size="small"
          sx={{ maxWidth: { sm: 160 } }}
          value={form.country}
          onChange={(event) => setForm((prev) => ({ ...prev, country: event.target.value }))}
          required
        />
        <TextField
          label="Sector"
          size="small"
          fullWidth
          value={form.sector}
          onChange={(event) => setForm((prev) => ({ ...prev, sector: event.target.value }))}
        />
      </Stack>
      <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
        <TextField
          label="Floor area (m²)"
          type="number"
          size="small"
          fullWidth
          value={form.floorAreaM2}
          onChange={(event) => setForm((prev) => ({ ...prev, floorAreaM2: event.target.value }))}
          slotProps={{ htmlInput: { min: 0, step: "any" } }}
        />
        <TextField
          label="Headcount"
          type="number"
          size="small"
          fullWidth
          value={form.headcount}
          onChange={(event) => setForm((prev) => ({ ...prev, headcount: event.target.value }))}
          slotProps={{ htmlInput: { min: 0, step: 1 } }}
        />
        <TextField
          label="Opened"
          type="date"
          size="small"
          fullWidth
          value={form.openedAt}
          onChange={(event) => setForm((prev) => ({ ...prev, openedAt: event.target.value }))}
          slotProps={{ inputLabel: { shrink: true } }}
          required
        />
      </Stack>
      <SelectField
        label="Status"
        value={form.isActive ? "active" : "inactive"}
        onChange={(value) => setForm((prev) => ({ ...prev, isActive: value === "active" }))}
        options={[
          { value: "active", label: "Active site" },
          { value: "inactive", label: "Inactive site" },
        ]}
      />
    </DialogShell>
  );
}
