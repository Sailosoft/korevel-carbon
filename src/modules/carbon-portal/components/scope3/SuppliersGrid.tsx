"use client";

import { useState } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Typography from "@mui/material/Typography";
import { DataGrid, GridActionsCellItem, type GridColDef } from "@mui/x-data-grid";
import type { DataQuality, Supplier } from "../../db/types";
import { useSuppliers } from "../../hooks/useCarbonData";
import { formatCurrency } from "../../lib/format";
import { deleteSupplier } from "../../services/records";
import { SectionCard } from "../SectionCard";
import { QualityChip } from "../chips";
import { SupplierDialog } from "./SupplierDialog";

export function SuppliersGrid() {
  const suppliers = useSuppliers();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Supplier | null>(null);

  const columns: GridColDef<Supplier>[] = [
    { field: "name", headerName: "Supplier", width: 200, flex: 1 },
    { field: "category", headerName: "Category", width: 140 },
    { field: "country", headerName: "Country", width: 90 },
    {
      field: "annualSpend",
      headerName: "Annual spend",
      width: 140,
      type: "number",
      align: "right",
      headerAlign: "right",
      valueFormatter: (value) => formatCurrency(Number(value)),
    },
    {
      field: "dataQuality",
      headerName: "Data quality",
      width: 145,
      renderCell: (params) => <QualityChip quality={params.value as DataQuality} />,
    },
    {
      field: "rating",
      headerName: "Rating",
      width: 90,
      type: "number",
      align: "right",
      headerAlign: "right",
      valueFormatter: (value) => `${Number(value)} / 5`,
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
            if (window.confirm(`Delete supplier "${params.row.name}"?`)) {
              void deleteSupplier(params.row.id);
            }
          }}
        />,
      ],
    },
  ];

  return (
    <SectionCard
      title="Suppliers"
      subtitle="Scope 3 category 1 and 4 value-chain partners"
      actions={
        <Button
          size="small"
          variant="outlined"
          onClick={() => {
            setEditing(null);
            setDialogOpen(true);
          }}
        >
          Add supplier
        </Button>
      }
    >
      <Box sx={{ height: 360, width: "100%" }}>
        <DataGrid
          rows={suppliers ?? []}
          columns={columns}
          loading={suppliers === undefined}
          pageSizeOptions={[5, 10, 25]}
          initialState={{ pagination: { paginationModel: { pageSize: 5, page: 0 } } }}
          disableRowSelectionOnClick
          hideFooterSelectedRowCount
        />
      </Box>
      <SupplierDialog
        open={dialogOpen}
        supplier={editing}
        onClose={() => setDialogOpen(false)}
      />
    </SectionCard>
  );
}
