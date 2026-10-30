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
