"use client";

import { useMemo, useState } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import {
  DataGrid,
  GridActionsCellItem,
  type GridColDef,
} from "@mui/x-data-grid";
import type { Activity, DataQuality, Scope } from "../../db/types";
import {
  useEmissionMonths,
  useEmissionRows,
  type EmissionRow,
} from "../../hooks/useCarbonData";
import { formatMonth } from "../../lib/months";
import { formatQuantity, formatTonnes } from "../../lib/format";
import { deleteActivity } from "../../services/records";
import { usePortalStore } from "../../store/portalStore";
import { ActivityDialog } from "../ActivityDialog";
import { PortalPageHeader } from "../PortalPageHeader";
import { QualityChip, ScopeChip } from "../chips";
import { EmissionsFilterBar } from "./EmissionsFilterBar";

export function EmissionsExplorer() {
  const rows = useEmissionRows();
  const months = useEmissionMonths() ?? [];
  const facilityId = usePortalStore((state) => state.facilityId);
  const scope = usePortalStore((state) => state.scope);
  const period = usePortalStore((state) => state.period);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Activity | null>(null);

  const filteredRows = useMemo(
    () =>
      (rows ?? []).filter(
        (row) =>
          (facilityId === null || row.facilityId === facilityId) &&
          (scope === null || row.scope === scope) &&
          (period === null || row.date === period),
      ),
    [rows, facilityId, scope, period],
  );

  const totalTonnes = useMemo(
    () => filteredRows.reduce((sum, row) => sum + row.co2eTonnes, 0),
    [filteredRows],
  );

  const columns: GridColDef<EmissionRow>[] = [
    {
      field: "date",
      headerName: "Month",
      width: 110,
      valueFormatter: (value) => formatMonth(String(value)),
    },
    { field: "facilityName", headerName: "Facility", width: 170 },
    {
      field: "scope",
      headerName: "Scope",
      width: 100,
      renderCell: (params) => <ScopeChip scope={params.value as Scope} />,
    },
    { field: "sourceLabel", headerName: "Source", width: 175 },
    {
      field: "quantity",
      headerName: "Quantity",
      width: 145,
      type: "number",
      valueFormatter: (value, row) => `${formatQuantity(Number(value))} ${row.unit}`,
    },
    {
      field: "co2eTonnes",
      headerName: "t CO2e",
      width: 120,
      type: "number",
      align: "right",
      headerAlign: "right",
      valueFormatter: (value) => formatTonnes(Number(value), 1),
    },
    {
      field: "factorActivity",
      headerName: "Emission factor",
      width: 210,
      flex: 1,
      minWidth: 150,
      valueFormatter: (value) => (value ? String(value) : "No factor matched"),
    },
    {
      field: "dataQuality",
      headerName: "Quality",
      width: 135,
      renderCell: (params) => <QualityChip quality={params.value as DataQuality} />,
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
            setEditing(params.row.activity);
            setDialogOpen(true);
          }}
        />,
        <GridActionsCellItem
          key="delete"
          label="Delete"
          icon={<Typography variant="caption">Delete</Typography>}
          onClick={() => {
            if (window.confirm("Delete this activity and its calculated emission?")) {
              void deleteActivity(params.row.id);
            }
          }}
        />,
      ],
    },
  ];

  const handleAdd = () => {
    setEditing(null);
    setDialogOpen(true);
  };

  return (
    <Stack spacing={3}>
      <PortalPageHeader
        title="Emissions explorer"
        subtitle="Activity data joined with calculated emissions. Editing an activity recalculates its emission automatically."
        actions={
          <Button variant="contained" onClick={handleAdd}>
            Add activity
          </Button>
        }
      />
      <EmissionsFilterBar months={months} />
      <Box sx={{ height: 560, width: "100%" }}>
        <DataGrid
          rows={filteredRows}
          columns={columns}
          pageSizeOptions={[10, 25, 50]}
          initialState={{
            pagination: { paginationModel: { pageSize: 25, page: 0 } },
          }}
          disableRowSelectionOnClick
          loading={rows === undefined}
          sx={{
            "& .MuiDataGrid-columnHeaders": { bgcolor: "grey.50" },
          }}
        />
      </Box>
      <Stack
        direction="row"
        spacing={2}
        sx={{ justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", rowGap: 1 }}
      >
        <Typography variant="body2" color="text.secondary">
          {filteredRows.length} activities shown
          {filteredRows.length !== (rows ?? []).length ? ` of ${rows?.length ?? 0}` : ""} ·{" "}
          {facilityId || scope !== null || period !== null ? "filtered" : "all data"}
        </Typography>
        <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
          Total {formatTonnes(totalTonnes, 1)} t CO2e
        </Typography>
      </Stack>
      <ActivityDialog
        open={dialogOpen}
        activity={editing}
        defaultScope={scope ?? undefined}
        onClose={() => setDialogOpen(false)}
      />
    </Stack>
  );
}
