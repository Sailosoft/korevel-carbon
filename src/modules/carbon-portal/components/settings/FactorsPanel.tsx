"use client";

import { useState } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import { DataGrid, GridActionsCellItem, type GridColDef } from "@mui/x-data-grid";
import type { EmissionFactor } from "../../db/types";
import { useEmissionFactors } from "../../hooks/useCarbonData";
import { formatQuantity } from "../../lib/format";
import { deleteFactor } from "../../services/records";
import { SectionCard } from "../SectionCard";
import { ScopeChip } from "../chips";
import { FactorDialog } from "./FactorDialog";

export function FactorsPanel() {
  const factors = useEmissionFactors();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<EmissionFactor | null>(null);

  const columns: GridColDef<EmissionFactor>[] = [
    { field: "key", headerName: "Key", width: 210 },
    {
      field: "scope",
      headerName: "Scope",
      width: 100,
      renderCell: (params) => <ScopeChip scope={params.value as 1 | 2 | 3} />,
    },
    { field: "category", headerName: "Category", width: 165 },
    { field: "activity", headerName: "Activity", width: 210, flex: 1, minWidth: 160 },
    { field: "unit", headerName: "Unit", width: 110 },
    {
      field: "co2ePerUnit",
      headerName: "kg CO2e/unit",
      width: 140,
      type: "number",
      align: "right",
      headerAlign: "right",
      valueFormatter: (value) => formatQuantity(Number(value)),
    },
    {
      field: "source",
      headerName: "Source",
      width: 100,
      valueFormatter: (value, row) => `${String(value)} ${row.vintageYear}`,
    },
    { field: "region", headerName: "Region", width: 90, valueFormatter: (value) => value ?? "Global" },
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
            if (window.confirm(`Delete factor "${params.row.key}"?`)) {
              void deleteFactor(params.row.id);
            }
          }}
        />,
      ],
    },
  ];

  return (
    <SectionCard
      title="Emission factors"
      subtitle="Factor library used to convert activity data into CO2e"
      actions={
        <Button
          size="small"
          variant="outlined"
          onClick={() => {
            setEditing(null);
            setDialogOpen(true);
          }}
        >
          Add factor
        </Button>
      }
    >
      <Box sx={{ height: 420, width: "100%" }}>
        <DataGrid
          rows={factors ?? []}
          columns={columns}
          loading={factors === undefined}
          pageSizeOptions={[5, 10, 25]}
          initialState={{ pagination: { paginationModel: { pageSize: 10, page: 0 } } }}
          disableRowSelectionOnClick
          hideFooterSelectedRowCount
        />
      </Box>
      <FactorDialog open={dialogOpen} factor={editing} onClose={() => setDialogOpen(false)} />
    </SectionCard>
  );
}
