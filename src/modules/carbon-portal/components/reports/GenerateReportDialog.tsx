"use client";

import { useState } from "react";
import Alert from "@mui/material/Alert";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import { generateReport } from "../../services/reporting";
import { MONTH_OPTIONS, formatMonth, monthRange } from "../../lib/months";
import { DialogShell } from "../DialogShell";
import { useDialogForm } from "../useDialogForm";
import { SelectField, type SelectOption } from "../SelectField";

type GenerateReportDialogProps = {
  open: boolean;
  onClose: () => void;
};

type FormState = {
  title: string;
  periodStart: string;
  periodEnd: string;
};

const MONTH_SELECT_OPTIONS: SelectOption[] = MONTH_OPTIONS.map((month) => ({
  value: month,
  label: formatMonth(month),
}));

function buildForm(): FormState {
  return {
    title: "",
    periodStart: "2026-07",
    periodEnd: "2026-09",
  };
}

export function GenerateReportDialog({ open, onClose }: GenerateReportDialogProps) {
  const [saving, setSaving] = useState(false);
  const { form, setForm, error, setError } = useDialogForm<FormState, null>(
    open,
    null,
    () => buildForm(),
  );

  const periodInvalid = form.periodStart > form.periodEnd;
  const valid = form.title.trim() !== "" && !periodInvalid && !saving;

  const handleSave = async () => {
    if (!valid) return;
    setSaving(true);
    setError(null);
    try {
      await generateReport({
        title: form.title.trim(),
        periodStart: form.periodStart,
        periodEnd: form.periodEnd,
      });
      onClose();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : String(cause));
    } finally {
      setSaving(false);
    }
  };

  const monthCount = periodInvalid ? 0 : monthRange(form.periodStart, form.periodEnd).length;

  return (
    <DialogShell
      open={open}
      title="Generate report"
      onClose={onClose}
      onSave={handleSave}
      saving={saving}
      saveLabel="Generate snapshot"
    >
      {error ? <Alert severity="error">{error}</Alert> : null}
      <TextField
        label="Report title"
        size="small"
        fullWidth
        value={form.title}
        onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))}
        placeholder="Q4 2026 Internal Review"
        required
      />
      <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
        <SelectField
          label="Period start"
          value={form.periodStart}
          onChange={(periodStart) => setForm((prev) => ({ ...prev, periodStart }))}
          options={MONTH_SELECT_OPTIONS}
          required
        />
        <SelectField
          label="Period end"
          value={form.periodEnd}
          onChange={(periodEnd) => setForm((prev) => ({ ...prev, periodEnd }))}
          options={MONTH_SELECT_OPTIONS}
          required
        />
      </Stack>
      <Alert severity={periodInvalid ? "warning" : "info"} variant="outlined">
        {periodInvalid
          ? "Period end must be on or after period start."
          : `The current scope totals for ${monthCount} month${monthCount === 1 ? "" : "s"} will be frozen into the report.`}
      </Alert>
    </DialogShell>
  );
}
