"use client";

import { useState } from "react";
import Link from "next/link";
import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";
import FormControl from "@mui/material/FormControl";
import Grid from "@mui/material/Grid";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import TextField from "@mui/material/TextField";
import type { User, UserRole, UserStatus } from "../../../db/types";
import { CustomDialog } from "../../../shared/components/CustomDialog";
import { useUiStore } from "../../../stores/uiStore";
import { useDepartmentOptions } from "../../department/hooks/useDepartments";
import { saveUser } from "../services/userService";
import { USER_ROLE_OPTIONS, USER_STATUS_OPTIONS } from "../types";

const DEPARTMENTS_HREF = "/modules/glassglow-erp/departments";

type UserDialogProps = {
  open: boolean;
  user: User | null;
  onClose: () => void;
};

type FormState = {
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  departmentId: string;
};

function buildForm(user: User | null): FormState {
  if (user) {
    return {
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
      departmentId: user.departmentId,
    };
  }
  return {
    name: "",
    email: "",
    role: "staff",
    status: "active",
    departmentId: "",
  };
}

export function UserDialog({ open, user, onClose }: UserDialogProps) {
  const notify = useUiStore((state) => state.notify);
  const departmentOptions = useDepartmentOptions();
  const [form, setForm] = useState<FormState>(() => buildForm(user));
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const userId = user?.id ?? null;
  const [previous, setPrevious] = useState({ open, userId });
  if (previous.open !== open || previous.userId !== userId) {
    setPrevious({ open, userId });
    if (open) {
      setForm(buildForm(user));
      setError(null);
    }
  }

  const hasDepartments = departmentOptions !== undefined && departmentOptions.length > 0;

  const handleSave = async () => {
    if (saving) return;
    setSaving(true);
    setError(null);
    try {
      const saved = await saveUser({
        id: user?.id,
        name: form.name,
        email: form.email,
        role: form.role,
        status: form.status,
        departmentId: form.departmentId,
      });
      notify(user ? `${saved.name} updated.` : `${saved.name} added.`, "success");
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
      title={user ? "Edit user" : "Add user"}
      error={error}
      busy={saving}
      actions={
        <>
          <Button onClick={onClose} color="inherit" disabled={saving}>
            Cancel
          </Button>
          <Button variant="contained" onClick={handleSave} disabled={saving || !hasDepartments}>
            {saving ? "Saving…" : user ? "Save changes" : "Create user"}
          </Button>
        </>
      }
    >
      {departmentOptions !== undefined && departmentOptions.length === 0 ? (
        <Alert severity="info">
          No departments exist yet. <Link href={DEPARTMENTS_HREF}>Create a department</Link>{" "}
          before adding users.
        </Alert>
      ) : null}
      <TextField
        label="Full name"
        size="small"
        fullWidth
        required
        autoFocus
        value={form.name}
        onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
      />
      <TextField
        label="Email"
        type="email"
        size="small"
        fullWidth
        required
        value={form.email}
        onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
        helperText="Stored lower-case and must be unique."
      />
      <FormControl fullWidth size="small" required>
        <InputLabel id="user-dialog-department-label">Department</InputLabel>
        <Select
          labelId="user-dialog-department-label"
          id="user-dialog-department"
          label="Department"
          displayEmpty
          value={form.departmentId}
          disabled={!hasDepartments}
          onChange={(event) =>
            setForm((prev) => ({ ...prev, departmentId: String(event.target.value) }))
          }
        >
          <MenuItem value="" disabled>
            <em>Select a department</em>
          </MenuItem>
          {(departmentOptions ?? []).map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, sm: 6 }}>
          <FormControl fullWidth size="small" required>
            <InputLabel id="user-dialog-role-label">Role</InputLabel>
            <Select
              labelId="user-dialog-role-label"
              id="user-dialog-role"
              label="Role"
              value={form.role}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, role: event.target.value as UserRole }))
              }
            >
              {USER_ROLE_OPTIONS.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <FormControl fullWidth size="small" required>
            <InputLabel id="user-dialog-status-label">Status</InputLabel>
            <Select
              labelId="user-dialog-status-label"
              id="user-dialog-status"
              label="Status"
              value={form.status}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, status: event.target.value as UserStatus }))
              }
            >
              {USER_STATUS_OPTIONS.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
      </Grid>
    </CustomDialog>
  );
}
