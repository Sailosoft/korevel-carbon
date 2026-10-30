"use client";

import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import { GlassPanel } from "../../../shared/components/GlassPanel";
import { useDepartmentTableStore } from "../stores/departmentTableStore";

type DepartmentsToolbarProps = {
  onAdd: () => void;
};

export function DepartmentsToolbar({ onAdd }: DepartmentsToolbarProps) {
  const search = useDepartmentTableStore((state) => state.search);
  const setSearch = useDepartmentTableStore((state) => state.setSearch);
  const resetFilters = useDepartmentTableStore((state) => state.resetFilters);

  return (
    <GlassPanel sx={{ p: 2 }}>
      <Stack
        direction={{ xs: "column", md: "row" }}
        spacing={1.5}
        sx={{ alignItems: { xs: "stretch", md: "center" }, flexWrap: "wrap" }}
      >
        <TextField
          size="small"
          label="Search departments"
          placeholder="Name, code or description"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          sx={{ minWidth: { xs: "100%", md: 260 }, flex: 1 }}
        />
        <Stack
          direction="row"
          spacing={1}
          sx={{ ml: { md: "auto" }, justifyContent: { xs: "flex-end", md: "flex-start" } }}
        >
          <Button color="inherit" onClick={resetFilters} disabled={search === ""}>
            Clear filters
          </Button>
          <Button variant="contained" onClick={onAdd}>
            Add department
          </Button>
        </Stack>
      </Stack>
    </GlassPanel>
  );
}
