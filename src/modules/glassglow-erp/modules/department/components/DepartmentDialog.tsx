"use client";

import { useState } from "react";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import type { Department } from "../../../db/types";
import { CustomDialog } from "../../../shared/components/CustomDialog";
import { useUiStore } from "../../../stores/uiStore";
import { saveDepartment } from "../services/departmentService";

type DepartmentDialogProps = {
  open: boolean;
  department: Department | null;
  onClose: () => void;
};

type FormState = {
  name: string;
  code: string;
  description: string;
};

function buildForm(department: Department | null): FormState {
  if (department) {
    return {
      name: department.name,
      code: department.code,
      description: department.description,
    };
  }
  return { name: "", code: "", description: "" };
}

export function DepartmentDialog({ open, department, onClose }: DepartmentDialogProps) {
  const notify = useUiStore((state) => state.notify);
  const [form, setForm] = useState<FormState>(() => buildForm(department));
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const departmentId = department?.id ?? null;
  const [previous, setPrevious] = useState({ open, departmentId });
  if (previous.open !== open || previous.departmentId !== departmentId) {
    setPrevious({ open, departmentId });
    if (open) {
      setForm(buildForm(department));
      setError(null);
    }
  }

  const handleSave = async () => {
    if (saving) return;
    setSaving(true);
    setError(null);
    try {
      const saved = await saveDepartment({
        id: department?.id,
        name: form.name,
        code: form.code,
        description: form.description,
      });
      notify(department ? `${saved.name} updated.` : `${saved.name} added.`, "success");
      onClose();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : String(cause));
    } finally {
      setSaving(false);
    }
  };

  return (
    <CustomDialog
      open={open}
      onClose={onClose}
      title={department ? "Edit department" : "Add department"}
      error={error}
      busy={saving}
      actions={
        <>
          <Button onClick={onClose} color="inherit" disabled={saving}>
            Cancel
          </Button>
          <Button variant="contained" onClick={handleSave} disabled={saving}>
            {saving ? "Saving…" : department ? "Save changes" : "Create department"}
          </Button>
        </>
      }
    >
      <Stack spacing={2}>
        <TextField
          label="Name"
          size="small"
          fullWidth
          required
          autoFocus
          value={form.name}
          onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
        />
        <TextField
          label="Code"
          size="small"
          fullWidth
          required
          value={form.code}
          onChange={(event) =>
            setForm((prev) => ({ ...prev, code: event.target.value.toUpperCase() }))
          }
          helperText="2–10 letters or digits, starting with a letter. Stored upper-case and unique."
        />
        <TextField
          label="Description"
          size="small"
          fullWidth
          multiline
          minRows={3}
          value={form.description}
          onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))}
        />
      </Stack>
    </CustomDialog>
  );
}
