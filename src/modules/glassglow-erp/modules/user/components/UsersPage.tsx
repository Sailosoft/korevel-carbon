"use client";

import { useMemo, useState } from "react";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import type { Department, User } from "../../../db/types";
import { useDebouncedValue } from "../../../hooks/useDebouncedValue";
import { PageHeader } from "../../../shared/components/PageHeader";
import { useDepartments } from "../../department/hooks/useDepartments";
import { filterUsers } from "../services/userStats";
import { useUserTableStore } from "../stores/userTableStore";
import { useUsers } from "../hooks/useUsers";
import { DeleteUserDialog } from "./DeleteUserDialog";
import { UserDialog } from "./UserDialog";
import { UsersTable } from "./UsersTable";
import { UsersToolbar } from "./UsersToolbar";

export function UsersPage() {
  const users = useUsers();
  const departments = useDepartments();
  const search = useUserTableStore((state) => state.search);
  const role = useUserTableStore((state) => state.role);
  const status = useUserTableStore((state) => state.status);
  const departmentId = useUserTableStore((state) => state.departmentId);
  const debouncedSearch = useDebouncedValue(search, 200);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<User | null>(null);
  const [deleting, setDeleting] = useState<User | null>(null);

  const departmentsById = useMemo(
    () => new Map<string, Department>((departments ?? []).map((department) => [department.id, department])),
    [departments],
  );

  const rows = useMemo(
    () =>
      filterUsers(
        users ?? [],
        { search: debouncedSearch, role, status, departmentId },
        departmentsById,
      ),
    [users, debouncedSearch, role, status, departmentId, departmentsById],
  );

  const handleAdd = () => {
    setEditing(null);
    setDialogOpen(true);
  };

  const handleEdit = (user: User) => {
    setEditing(user);
    setDialogOpen(true);
  };

  return (
    <Stack spacing={3}>
      <PageHeader
        title="Users"
        subtitle="Manage the Glassglow directory: roles, account status and department assignments."
      />
      <UsersToolbar onAdd={handleAdd} />
      <UsersTable
        rows={rows}
        departmentsById={departmentsById}
        loading={users === undefined || departments === undefined}
        onEdit={handleEdit}
        onDelete={setDeleting}
      />
      <Typography variant="body2" color="text.secondary">
        {rows.length} of {users?.length ?? 0} users shown · changes are stored locally in
        IndexedDB
      </Typography>
      <UserDialog open={dialogOpen} user={editing} onClose={() => setDialogOpen(false)} />
      <DeleteUserDialog
        open={deleting !== null}
        user={deleting}
        onClose={() => setDeleting(null)}
      />
    </Stack>
  );
}
