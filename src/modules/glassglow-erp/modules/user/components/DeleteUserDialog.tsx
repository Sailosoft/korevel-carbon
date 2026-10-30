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
