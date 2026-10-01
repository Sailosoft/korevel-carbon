"use client";

import { useState } from "react";
import Alert from "@mui/material/Alert";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import type { DataQuality, Supplier } from "../../db/types";
import { saveSupplier } from "../../services/records";
import { DialogShell } from "../DialogShell";
import { useDialogForm } from "../useDialogForm";
import { SelectField, type SelectOption } from "../SelectField";

type SupplierDialogProps = {
  open: boolean;
  supplier: Supplier | null;
  onClose: () => void;
};

type FormState = {
  name: string;
  category: string;
  country: string;
  annualSpend: string;
  dataQuality: DataQuality;
  rating: string;
  isActive: boolean;
};

const QUALITY_OPTIONS: SelectOption[] = [
  { value: "primary", label: "Primary (supplier-provided)" },
  { value: "secondary", label: "Secondary (industry averages)" },
  { value: "spend_based", label: "Spend-based" },
];

const RATING_OPTIONS: SelectOption[] = [1, 2, 3, 4, 5].map((rating) => ({
  value: String(rating),
  label: `${rating} / 5`,
}));

function buildForm(supplier: Supplier | null): FormState {
  if (supplier) {
    return {
      name: supplier.name,
      category: supplier.category,
      country: supplier.country,
      annualSpend: String(supplier.annualSpend),
      dataQuality: supplier.dataQuality,
      rating: String(supplier.rating),
      isActive: supplier.isActive,
    };
  }
  return {
    name: "",
    category: "",
    country: "",
    annualSpend: "",
    dataQuality: "secondary",
    rating: "3",
    isActive: true,
  };
}

export function SupplierDialog({ open, supplier, onClose }: SupplierDialogProps) {
  const [saving, setSaving] = useState(false);
  const { form, setForm, error, setError } = useDialogForm<FormState, Supplier | null>(
    open,
    supplier,
    buildForm,
  );

  const annualSpend = Number(form.annualSpend);
  const valid =
    form.name.trim() !== "" &&
    form.category.trim() !== "" &&
    form.country.trim() !== "" &&
    Number.isFinite(annualSpend) &&
    annualSpend >= 0 &&
    !saving;

  const handleSave = async () => {
    if (!valid) return;
    setSaving(true);
    setError(null);
    try {
      await saveSupplier({
        id: supplier?.id ?? `sup-${crypto.randomUUID()}`,
        name: form.name.trim(),
        category: form.category.trim(),
        country: form.country.trim().toUpperCase().slice(0, 2),
        annualSpend,
        dataQuality: form.dataQuality,
        rating: Number(form.rating),
        isActive: form.isActive,
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
      title={supplier ? "Edit supplier" : "Add supplier"}
      onClose={onClose}
      onSave={handleSave}
      saving={saving}
    >
      {error ? <Alert severity="error">{error}</Alert> : null}
      <TextField
        label="Supplier name"
        size="small"
        fullWidth
        value={form.name}
        onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
        required
      />
      <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
        <TextField
          label="Category"
          size="small"
          fullWidth
          value={form.category}
          onChange={(event) => setForm((prev) => ({ ...prev, category: event.target.value }))}
          placeholder="Raw materials"
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
      </Stack>
      <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
        <TextField
          label="Annual spend (EUR)"
          type="number"
          size="small"
          fullWidth
          value={form.annualSpend}
          onChange={(event) => setForm((prev) => ({ ...prev, annualSpend: event.target.value }))}
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
        />
      </Stack>
      <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
        <SelectField
          label="Engagement rating"
          value={form.rating}
          onChange={(rating) => setForm((prev) => ({ ...prev, rating }))}
          options={RATING_OPTIONS}
        />
        <SelectField
          label="Status"
          value={form.isActive ? "active" : "inactive"}
          onChange={(value) => setForm((prev) => ({ ...prev, isActive: value === "active" }))}
          options={[
            { value: "active", label: "Active" },
            { value: "inactive", label: "Inactive" },
          ]}
        />
      </Stack>
    </DialogShell>
  );
}
