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
