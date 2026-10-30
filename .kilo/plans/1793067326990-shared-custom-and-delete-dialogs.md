# Shared CustomDialog + reusable DeleteDialog for Glassglow ERP

## Goal

Extract dialog scaffolding into two reusable components under the Glassglow ERP module's shared
folder, then refactor the user feature dialogs to consume them:

1. `CustomDialog` — generic MUI dialog shell (title, description, body, error, busy state,
   standard cancel/confirm footer, optional custom actions).
2. `DeleteDialog` — destructive confirmation built on `CustomDialog` that owns async
   busy/error state, closes on success, and shows the thrown error on failure.
3. `DeleteUserDialog` becomes a thin domain wrapper around `DeleteDialog`; `UserDialog` is
   rebuilt on `CustomDialog`; the old `ConfirmDialog` is deleted (its only consumer was
   `DeleteUserDialog`).

## Decisions (confirmed with user)

- **Location:** `src/modules/glassglow-erp/shared/components` (module-scoped shared).
- **DeleteDialog API:** owns `busy`/`error`, accepts `onConfirm: () => Promise<void>`, shows
  `Deleting…`, calls `onClose()` on success, and renders the caught error without closing on
  failure.
- **Refactor scope:** rebuild `UserDialog` on `CustomDialog`; delete
  `shared/components/ConfirmDialog.tsx` (verified: only `DeleteUserDialog` imports it).
- **No new dependencies.** MUI v9 components already in use.
- **No barrel file** for shared components; follow the existing direct-relative-import
  convention.

## Verified current state

- `DeleteUserDialog.tsx` owns busy/error and passes `destructive`, `confirmLabel`,
  `description` to `ConfirmDialog`.
- `UserDialog.tsx` duplicates the same `Dialog` / `DialogTitle` / `DialogContent` /
  `DialogActions` / error-alert scaffold.
- `ConfirmDialog.tsx` props: `open`, `title`, `description`, `confirmLabel`, `cancelLabel`,
  `destructive`, `busy`, `error`, `onConfirm`, `onCancel`.
- Both user dialogs use the render-phase reset pattern for open transitions (to satisfy the
  `react-hooks/set-state-in-effect` lint rule). Keep that pattern; do not add effects.
- `users` data can be `null`; `DeleteUserDialog` must still handle a missing user.
- Repo validation commands: `bun run typecheck`, `bun run lint`.

## Files

| Action | Path |
| --- | --- |
| Add | `src/modules/glassglow-erp/shared/components/CustomDialog.tsx` |
| Add | `src/modules/glassglow-erp/shared/components/DeleteDialog.tsx` |
| Rewrite | `src/modules/glassglow-erp/modules/user/components/DeleteUserDialog.tsx` |
| Rewrite (render section) | `src/modules/glassglow-erp/modules/user/components/UserDialog.tsx` |
| Delete | `src/modules/glassglow-erp/shared/components/ConfirmDialog.tsx` |

## Tasks

### 1. Add `shared/components/CustomDialog.tsx`

Client component. Presentation-only shell; callers keep their own save state.

```tsx
"use client";

import type { ReactNode } from "react";
import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";
import Dialog, { type DialogProps } from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

export type CustomDialogProps = {
  open: boolean;
  onClose: () => void;
  title: ReactNode;
  description?: ReactNode;
  children?: ReactNode;
  error?: string | null;
  busy?: boolean;
  busyLabel?: string;
  cancelLabel?: string;
  confirmLabel?: string;
  destructive?: boolean;
  onConfirm?: () => void;
  /** Replaces the default Cancel/Confirm footer when provided. */
  actions?: ReactNode;
  maxWidth?: DialogProps["maxWidth"];
  fullWidth?: boolean;
  dividers?: boolean;
};

export function CustomDialog({
  open,
  onClose,
  title,
  description,
  children,
  error = null,
  busy = false,
  busyLabel = "Working…",
  cancelLabel = "Cancel",
  confirmLabel = "Confirm",
  destructive = false,
  onConfirm,
  actions,
  maxWidth = "sm",
  fullWidth = true,
  dividers = true,
}: CustomDialogProps) {
  const handleClose = () => {
    if (!busy) onClose();
  };

  const footer =
    actions ??
    (onConfirm ? (
      <>
        <Button onClick={onClose} color="inherit" disabled={busy}>
          {cancelLabel}
        </Button>
        <Button
          variant="contained"
          color={destructive ? "error" : "primary"}
          onClick={onConfirm}
          disabled={busy}
        >
          {busy ? busyLabel : confirmLabel}
        </Button>
      </>
    ) : null);

  return (
    <Dialog open={open} onClose={handleClose} maxWidth={maxWidth} fullWidth={fullWidth}>
      <DialogTitle sx={{ fontWeight: 700 }}>{title}</DialogTitle>
      <DialogContent dividers={dividers}>
        <Stack spacing={2} sx={{ pt: dividers ? 0.5 : 0 }}>
          {description ? (
            <Typography variant="body2" color="text.secondary">
              {description}
            </Typography>
          ) : null}
          {error ? <Alert severity="error">{error}</Alert> : null}
          {children}
        </Stack>
      </DialogContent>
      {footer ? <DialogActions sx={{ px: 3, py: 2 }}>{footer}</DialogActions> : null}
    </Dialog>
  );
}
```

Notes:
- Backdrop/Esc are ignored while `busy` (same behavior as the current dialogs).
- No footer renders when neither `actions` nor `onConfirm` is supplied.
- `error` sits directly above `children` so form dialogs show it at the top of the body.

### 2. Add `shared/components/DeleteDialog.tsx`

Reusable destructive confirmation; owns busy/error and open-transition reset.

```tsx
"use client";

import { useState, type ReactNode } from "react";
import { CustomDialog } from "./CustomDialog";

export type DeleteDialogProps = {
  open: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  title?: string;
  description: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  busyLabel?: string;
};

export function DeleteDialog({
  open,
  onClose,
  onConfirm,
  title = "Delete item",
  description,
  confirmLabel = "Delete",
  cancelLabel = "Cancel",
  busyLabel = "Deleting…",
}: DeleteDialogProps) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [previousOpen, setPreviousOpen] = useState(open);
  if (previousOpen !== open) {
    setPreviousOpen(open);
    if (open) setError(null);
  }

  const handleConfirm = async () => {
    if (busy) return;
    setBusy(true);
    setError(null);
    try {
      await onConfirm();
      onClose();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : String(cause));
    } finally {
      setBusy(false);
    }
  };

  return (
    <CustomDialog
      open={open}
      onClose={onClose}
      title={title}
      description={description}
      confirmLabel={confirmLabel}
      cancelLabel={cancelLabel}
      destructive
      busy={busy}
      busyLabel={busyLabel}
      error={error}
      maxWidth="xs"
      onConfirm={handleConfirm}
    />
  );
}
```

Failure modes handled:
- Double submit blocked by the `busy` guard and disabled buttons.
- Reopen clears stale error via render-phase reset (no effect).
- Rejected `onConfirm` keeps the dialog open and shows the error message.

### 3. Rewrite `modules/user/components/DeleteUserDialog.tsx`

Thin wrapper: supply user-specific copy and the delete service; no local busy/error state.

```tsx
"use client";

import type { User } from "../../../db/types";
import { DeleteDialog } from "../../../shared/components/DeleteDialog";
import { useUiStore } from "../../../stores/uiStore";
import { deleteUser } from "../services/userService";

type DeleteUserDialogProps = {
  open: boolean;
  user: User | null;
  onClose: () => void;
};

export function DeleteUserDialog({ open, user, onClose }: DeleteUserDialogProps) {
  const notify = useUiStore((state) => state.notify);

  const handleConfirm = async () => {
    if (!user) throw new Error("This user no longer exists.");
    await deleteUser(user.id);
    notify(`${user.name} deleted.`, "success");
  };

  return (
    <DeleteDialog
      open={open}
      title="Delete user"
      description={
        user
          ? `This permanently removes ${user.name} (${user.email}). This action cannot be undone.`
          : "This user no longer exists."
      }
      confirmLabel="Delete user"
      onConfirm={handleConfirm}
      onClose={onClose}
    />
  );
}
```

Behavior change to note: when `user` is `null`, the confirm now throws so the existing
"no longer exists" copy is paired with an inline error instead of silently doing nothing.

### 4. Rebuild `modules/user/components/UserDialog.tsx` on `CustomDialog`

Keep all form state, `buildForm`, `handleSave`, and the render-phase open reset unchanged.
Only replace the MUI dialog scaffold and imports.

Remove imports: `Alert`, `Button`, `Dialog`, `DialogActions`, `DialogContent`,
`DialogTitle`, `Stack`.

Add import: `import { CustomDialog } from "../../../shared/components/CustomDialog";`

Replace the returned JSX with:

```tsx
return (
  <CustomDialog
    open={open}
    onClose={onClose}
    title={user ? "Edit user" : "Add user"}
    error={error}
    busy={saving}
    busyLabel="Saving…"
    confirmLabel={user ? "Save changes" : "Create user"}
    onConfirm={handleSave}
  >
    <TextField
      label="Full name"
      size="small"
      fullWidth
      required
      autoFocus
      value={form.name}
      onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
    />
    {/* Email + Department fields unchanged */}
    <Grid container spacing={2}>{/* role/status selects unchanged */}</Grid>
  </CustomDialog>
);
```

`CustomDialog` already provides the `Stack spacing={2}` wrapper, the `sm`/`fullWidth` dialog,
the title weight, the error alert, the Cancel button, and close-blocking while `saving`.

### 5. Delete `shared/components/ConfirmDialog.tsx`

- Remove the file.
- `rg "ConfirmDialog" src` must return no results.

## Validation

1. `bun run typecheck` and `bun run lint` pass.
2. `rg "ConfirmDialog" src` returns nothing.
3. Manual (`bun run dev`, port 4020, `/modules/glassglow-erp/users`):
   - Add user: form submits, "added" snackbar, dialog closes, grid updates.
   - Edit user: fields prefill for the selected row, "updated" snackbar.
   - Save failure (e.g. duplicate email): inline error shows, dialog stays open, buttons
     re-enable.
   - Delete: confirm shows `Deleting…`, success closes and shows the snackbar.
   - Delete failure / stale user: error shows inline, dialog stays open, Cancel/backdrop/Esc
     still work when idle.
   - Esc/backdrop are ignored while saving or deleting.
   - Delete dialog is narrow (`xs`); form dialog is `sm` full-width.
4. Keyboard: Tab order reaches Cancel then Confirm; dialog closes on Esc when idle.

## Out of scope

- Migrating `carbon-portal`'s `DialogShell` and its feature dialogs to the new components.
- Moving the generic components to `src/shared` (user chose module-scoped shared).
- Adding tests (repo has no test runner configured).
