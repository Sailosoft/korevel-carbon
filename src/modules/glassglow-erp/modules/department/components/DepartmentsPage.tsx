"use client";

import { useMemo, useState } from "react";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { useDebouncedValue } from "../../../hooks/useDebouncedValue";
import { PageHeader } from "../../../shared/components/PageHeader";
import { useDepartmentsWithCounts } from "../hooks/useDepartments";
import { filterDepartments } from "../services/departmentStats";
import { useDepartmentTableStore } from "../stores/departmentTableStore";
import type { DepartmentWithCount } from "../types";
import { DeleteDepartmentDialog } from "./DeleteDepartmentDialog";
import { DepartmentDialog } from "./DepartmentDialog";
import { DepartmentsTable } from "./DepartmentsTable";
import { DepartmentsToolbar } from "./DepartmentsToolbar";

export function DepartmentsPage() {
  const departments = useDepartmentsWithCounts();
  const search = useDepartmentTableStore((state) => state.search);
  const debouncedSearch = useDebouncedValue(search, 200);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<DepartmentWithCount | null>(null);
  const [deleting, setDeleting] = useState<DepartmentWithCount | null>(null);

  const rows = useMemo(
    () => filterDepartments(departments ?? [], { search: debouncedSearch }),
    [departments, debouncedSearch],
  );

  const handleAdd = () => {
    setEditing(null);
    setDialogOpen(true);
  };

  const handleEdit = (department: DepartmentWithCount) => {
    setEditing(department);
    setDialogOpen(true);
  };

  return (
    <Stack spacing={3}>
      <PageHeader
        title="Departments"
        subtitle="Manage Glassglow departments, their codes and the users assigned to them."
      />
      <DepartmentsToolbar onAdd={handleAdd} />
      <DepartmentsTable
        rows={rows}
        loading={departments === undefined}
        onEdit={handleEdit}
        onDelete={setDeleting}
      />
      <Typography variant="body2" color="text.secondary">
        {rows.length} of {departments?.length ?? 0} departments shown · changes are stored
        locally in IndexedDB
      </Typography>
      <DepartmentDialog
        open={dialogOpen}
        department={editing}
        onClose={() => setDialogOpen(false)}
      />
      <DeleteDepartmentDialog
        open={deleting !== null}
        department={deleting}
        onClose={() => setDeleting(null)}
      />
    </Stack>
  );
}
