"use client";

import type { Department } from "../../../db/types";
import { DeleteDialog } from "../../../shared/components/DeleteDialog";
import { useUiStore } from "../../../stores/uiStore";
import { deleteDepartment } from "../services/departmentService";

type DeleteDepartmentDialogProps = {
  open: boolean;
  department: Department | null;
  onClose: () => void;
};

export function DeleteDepartmentDialog({
  open,
  department,
  onClose,
}: DeleteDepartmentDialogProps) {
  const notify = useUiStore((state) => state.notify);

  const handleConfirm = async () => {
    if (!department) throw new Error("This department no longer exists.");
    await deleteDepartment(department.id);
    notify(`${department.name} deleted.`, "success");
  };

  return (
    <DeleteDialog
      open={open}
      title="Delete department"
      description={
        department
          ? `This permanently removes ${department.name} (${department.code}). This action cannot be undone.`
          : "This department no longer exists."
      }
      confirmLabel="Delete department"
      onConfirm={handleConfirm}
      onClose={onClose}
    />
  );
}
