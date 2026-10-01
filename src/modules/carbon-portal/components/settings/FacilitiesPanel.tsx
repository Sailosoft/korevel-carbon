"use client";

import { useState } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Typography from "@mui/material/Typography";
import { DataGrid, GridActionsCellItem, type GridColDef } from "@mui/x-data-grid";
import type { Facility } from "../../db/types";
import { useFacilities } from "../../hooks/useCarbonData";
import { deleteFacility } from "../../services/records";
import { SectionCard } from "../SectionCard";
import { FacilityDialog } from "./FacilityDialog";

export function FacilitiesPanel() {
  const facilities = useFacilities();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Facility | null>(null);

  const columns: GridColDef<Facility>[] = [
    { field: "code", headerName: "Code", width: 120 },
    { field: "name", headerName: "Facility", width: 200, flex: 1 },
    {
      field: "city",
      headerName: "Location",
      width: 160,
      valueFormatter: (_value, row) => `${row.city}, ${row.country}`,
    },
    { field: "sector", headerName: "Sector", width: 140 },
    {
      field: "floorAreaM2",
      headerName: "Floor area",
      width: 120,
      type: "number",
      align: "right",
      headerAlign: "right",
      valueFormatter: (value) =>
        value === null || value === undefined
          ? "—"
          : `${Number(value).toLocaleString("en-GB")} m²`,
    },
    {
      field: "headcount",
      headerName: "Headcount",
      width: 110,
      type: "number",
      align: "right",
      headerAlign: "right",
      valueFormatter: (value) =>
        value === null || value === undefined ? "—" : Number(value).toLocaleString("en-GB"),
    },
    {
      field: "isActive",
      headerName: "Status",
      width: 100,
      renderCell: (params) => (
        <Chip
          size="small"
          label={params.value ? "Active" : "Inactive"}
          color={params.value ? "success" : "default"}
          variant="outlined"
        />
      ),
    },
    {
      field: "actions",
      headerName: "",
      type: "actions",
      width: 110,
      getActions: (params) => [
        <GridActionsCellItem
          key="edit"
          label="Edit"
          icon={<Typography variant="caption">Edit</Typography>}
          onClick={() => {
            setEditing(params.row);
            setDialogOpen(true);
          }}
        />,
        <GridActionsCellItem
          key="delete"
          label="Delete"
          icon={<Typography variant="caption">Delete</Typography>}
          onClick={() => {
            if (window.confirm(`Delete facility "${params.row.name}"?`)) {
              void deleteFacility(params.row.id);
            }
          }}
        />,
      ],
    },
  ];

  return (
    <SectionCard
      title="Facilities"
      subtitle="Sites and business units that own scope 1 and 2 emissions"
      actions={
        <Button
          size="small"
          variant="outlined"
          onClick={() => {
            setEditing(null);
            setDialogOpen(true);
          }}
        >
          Add facility
        </Button>
      }
    >
      <Box sx={{ height: 420, width: "100%" }}>
        <DataGrid
          rows={facilities ?? []}
          columns={columns}
          loading={facilities === undefined}
          pageSizeOptions={[5, 10, 25]}
          initialState={{ pagination: { paginationModel: { pageSize: 10, page: 0 } } }}
          disableRowSelectionOnClick
          hideFooterSelectedRowCount
        />
      </Box>
      <FacilityDialog open={dialogOpen} facility={editing} onClose={() => setDialogOpen(false)} />
    </SectionCard>
  );
}
