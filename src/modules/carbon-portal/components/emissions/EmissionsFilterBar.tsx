"use client";

import Button from "@mui/material/Button";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import Stack from "@mui/material/Stack";
import { useFacilities } from "../../hooks/useCarbonData";
import { formatMonth } from "../../lib/months";
import type { Scope } from "../../db/types";
import { usePortalStore } from "../../store/portalStore";

export function EmissionsFilterBar({ months }: { months: string[] }) {
  const facilities = useFacilities();
  const facilityId = usePortalStore((state) => state.facilityId);
  const scope = usePortalStore((state) => state.scope);
  const period = usePortalStore((state) => state.period);
  const setFacilityId = usePortalStore((state) => state.setFacilityId);
  const setScope = usePortalStore((state) => state.setScope);
  const setPeriod = usePortalStore((state) => state.setPeriod);
  const resetFilters = usePortalStore((state) => state.resetFilters);

  const isFiltered = facilityId !== null || scope !== null || period !== null;

  return (
    <Stack
      direction={{ xs: "column", sm: "row" }}
      spacing={1.5}
      sx={{ alignItems: { xs: "stretch", sm: "center" }, flexWrap: "wrap", rowGap: 1.5 }}
    >
      <FormControl size="small" sx={{ minWidth: 200 }}>
        <InputLabel id="filter-facility-label">Facility</InputLabel>
        <Select
          labelId="filter-facility-label"
          label="Facility"
          value={facilityId ?? ""}
          onChange={(event) => setFacilityId(event.target.value || null)}
        >
          <MenuItem value="">
            <em>All facilities</em>
          </MenuItem>
          {(facilities ?? []).map((facility) => (
            <MenuItem key={facility.id} value={facility.id}>
              {facility.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <FormControl size="small" sx={{ minWidth: 150 }}>
        <InputLabel id="filter-scope-label">Scope</InputLabel>
        <Select
          labelId="filter-scope-label"
          label="Scope"
          value={scope === null ? "" : String(scope)}
          onChange={(event) => setScope(event.target.value ? (Number(event.target.value) as Scope) : null)}
        >
          <MenuItem value="">
            <em>All scopes</em>
          </MenuItem>
          {[1, 2, 3].map((value) => (
            <MenuItem key={value} value={String(value)}>
              Scope {value}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <FormControl size="small" sx={{ minWidth: 170 }}>
        <InputLabel id="filter-period-label">Period</InputLabel>
        <Select
          labelId="filter-period-label"
          label="Period"
          value={period ?? ""}
          onChange={(event) => setPeriod(event.target.value || null)}
        >
          <MenuItem value="">
            <em>All months</em>
          </MenuItem>
          {months.map((month) => (
            <MenuItem key={month} value={month}>
              {formatMonth(month)}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <Button color="inherit" onClick={resetFilters} disabled={!isFiltered}>
        Reset filters
      </Button>
    </Stack>
  );
}
