"use client";

import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import {
  DataGrid,
  GridActionsCellItem,
  type GridColDef,
} from "@mui/x-data-grid";
import type { Department, User } from "../../../db/types";
import { formatDate, formatDateTime, getInitials } from "../../../lib/format";
import { EmptyState } from "../../../shared/components/EmptyState";
import { GlassPanel } from "../../../shared/components/GlassPanel";
import { RoleChip, UserStatusChip } from "./UserChips";

type UsersTableProps = {
  rows: User[];
  departmentsById: Map<string, Department>;
  loading: boolean;
  onEdit: (user: User) => void;
  onDelete: (user: User) => void;
};

function UsersEmptyOverlay() {
  return (
    <EmptyState
      title="No users match these filters"
      description="Try clearing the search or filters, or add a new user to the directory."
    />
  );
}

export function UsersTable({
  rows,
  departmentsById,
  loading,
  onEdit,
  onDelete,
}: UsersTableProps) {
  const columns: GridColDef<User>[] = [
    {
      field: "name",
      headerName: "User",
      flex: 1,
      minWidth: 220,
      renderCell: (params) => (
        <Stack direction="row" spacing={1.25} sx={{ alignItems: "center", height: "100%" }}>
          <Avatar
            sx={{
              width: 30,
              height: 30,
              fontSize: 12,
              fontWeight: 700,
              bgcolor: "rgba(79, 70, 229, 0.14)",
              color: "primary.main",
            }}
          >
            {getInitials(params.row.name)}
          </Avatar>
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            {params.row.name}
          </Typography>
        </Stack>
      ),
    },
    { field: "email", headerName: "Email", width: 230 },
    {
      field: "departmentId",
      headerName: "Department",
      width: 190,
      valueGetter: (value, row) => {
        const departmentId = typeof value === "string" ? value : row.departmentId;
        return departmentsById.get(departmentId)?.name ?? "Unknown";
      },
      renderCell: (params) => {
        const department = departmentsById.get(params.row.departmentId);
        if (!department) {
          return (
            <Typography variant="body2" color="text.secondary">
              —
            </Typography>
          );
        }
        return (
          <Stack spacing={0} sx={{ justifyContent: "center", height: "100%" }}>
            <Typography variant="body2">{department.name}</Typography>
            <Typography variant="caption" color="text.secondary">
              {department.code}
            </Typography>
          </Stack>
        );
      },
    },
    {
      field: "role",
      headerName: "Role",
      width: 120,
      renderCell: (params) => <RoleChip role={params.row.role} />,
    },
    {
      field: "status",
      headerName: "Status",
      width: 130,
      renderCell: (params) => <UserStatusChip status={params.row.status} />,
    },
    {
      field: "lastActiveAt",
      headerName: "Last active",
      width: 170,
      valueFormatter: (value) => formatDateTime(value ? String(value) : null),
    },
    {
      field: "createdAt",
      headerName: "Created",
      width: 130,
      valueFormatter: (value) => formatDate(value ? String(value) : null),
    },
    {
      field: "actions",
      headerName: "",
      type: "actions",
      width: 130,
      getActions: (params) => [
        <GridActionsCellItem
          key="edit"
          label="Edit"
          icon={
            <Typography variant="caption" sx={{ fontWeight: 700, color: "primary.main" }}>
              Edit
            </Typography>
          }
          onClick={() => onEdit(params.row)}
        />,
        <GridActionsCellItem
          key="delete"
          label="Delete"
          icon={
            <Typography variant="caption" sx={{ fontWeight: 700, color: "error.main" }}>
              Delete
            </Typography>
          }
          onClick={() => onDelete(params.row)}
        />,
      ],
    },
  ];

  return (
    <GlassPanel sx={{ p: 0, overflow: "hidden" }}>
      <Box sx={{ height: 600, width: "100%" }}>
        <DataGrid
          rows={rows}
          columns={columns}
          loading={loading}
          pageSizeOptions={[10, 25, 50]}
          initialState={{
            pagination: { paginationModel: { pageSize: 10, page: 0 } },
          }}
          disableRowSelectionOnClick
          slots={{ noRowsOverlay: UsersEmptyOverlay }}
          sx={{
            border: 0,
            bgcolor: "transparent",
            "& .MuiDataGrid-columnHeaders": { bgcolor: "rgba(79, 70, 229, 0.06)" },
            "& .MuiDataGrid-cell:focus, & .MuiDataGrid-cell:focus-within": { outline: "none" },
          }}
        />
      </Box>
    </GlassPanel>
  );
}
