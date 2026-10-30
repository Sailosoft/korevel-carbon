"use client";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import {
  DataGrid,
  GridActionsCellItem,
  type GridColDef,
} from "@mui/x-data-grid";
import { formatDate } from "../../../lib/format";
import { EmptyState } from "../../../shared/components/EmptyState";
import { GlassPanel } from "../../../shared/components/GlassPanel";
import type { DepartmentWithCount } from "../types";
import { DepartmentCodeChip } from "./DepartmentChips";

type DepartmentsTableProps = {
  rows: DepartmentWithCount[];
  loading: boolean;
  onEdit: (department: DepartmentWithCount) => void;
  onDelete: (department: DepartmentWithCount) => void;
};

function DepartmentsEmptyOverlay() {
  return (
    <EmptyState
      title="No departments match this search"
      description="Try a different search, or add a department to assign users."
    />
  );
}

export function DepartmentsTable({
  rows,
  loading,
  onEdit,
  onDelete,
}: DepartmentsTableProps) {
  const columns: GridColDef<DepartmentWithCount>[] = [
    {
      field: "code",
      headerName: "Code",
      width: 110,
      renderCell: (params) => <DepartmentCodeChip code={params.row.code} />,
    },
    {
      field: "name",
      headerName: "Department",
      flex: 1,
      minWidth: 220,
      renderCell: (params) => (
        <Typography variant="body2" sx={{ fontWeight: 600 }}>
          {params.row.name}
        </Typography>
      ),
    },
    {
      field: "description",
      headerName: "Description",
      flex: 1,
      minWidth: 220,
      renderCell: (params) => (
        <Typography variant="body2" color="text.secondary" noWrap>
          {params.row.description || "—"}
        </Typography>
      ),
    },
    {
      field: "memberCount",
      headerName: "Members",
      width: 110,
      type: "number",
      align: "left",
      headerAlign: "left",
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
      getActions: (params) => {
        const hasMembers = params.row.memberCount > 0;
        return [
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
            label={hasMembers ? "Reassign members before deleting" : "Delete"}
            disabled={hasMembers}
            icon={
              <Typography
                variant="caption"
                sx={{
                  fontWeight: 700,
                  color: hasMembers ? "text.disabled" : "error.main",
                }}
              >
                Delete
              </Typography>
            }
            onClick={() => onDelete(params.row)}
          />,
        ];
      },
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
          slots={{ noRowsOverlay: DepartmentsEmptyOverlay }}
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
