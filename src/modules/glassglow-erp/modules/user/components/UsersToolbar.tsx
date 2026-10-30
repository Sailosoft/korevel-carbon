"use client";

import Button from "@mui/material/Button";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import { GlassPanel } from "../../../shared/components/GlassPanel";
import type { UserRole, UserStatus } from "../../../db/types";
import { useDepartmentOptions } from "../../department/hooks/useDepartments";
import { USER_ROLE_OPTIONS, USER_STATUS_OPTIONS } from "../types";
import { useUserTableStore } from "../stores/userTableStore";

type UsersToolbarProps = {
  onAdd: () => void;
};

export function UsersToolbar({ onAdd }: UsersToolbarProps) {
  const departmentOptions = useDepartmentOptions();
  const search = useUserTableStore((state) => state.search);
  const role = useUserTableStore((state) => state.role);
  const status = useUserTableStore((state) => state.status);
  const departmentId = useUserTableStore((state) => state.departmentId);
  const setSearch = useUserTableStore((state) => state.setSearch);
  const setRole = useUserTableStore((state) => state.setRole);
  const setStatus = useUserTableStore((state) => state.setStatus);
  const setDepartmentId = useUserTableStore((state) => state.setDepartmentId);
  const resetFilters = useUserTableStore((state) => state.resetFilters);

  const hasFilters =
    search !== "" || role !== null || status !== null || departmentId !== null;

  return (
    <GlassPanel sx={{ p: 2 }}>
      <Stack
        direction={{ xs: "column", md: "row" }}
        spacing={1.5}
        sx={{ alignItems: { xs: "stretch", md: "center" }, flexWrap: "wrap" }}
      >
        <TextField
          size="small"
          label="Search users"
          placeholder="Name, email or department"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          sx={{ minWidth: { xs: "100%", md: 260 }, flex: 1 }}
        />
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel id="user-role-filter-label">Role</InputLabel>
          <Select
            labelId="user-role-filter-label"
            id="user-role-filter"
            label="Role"
            value={role ?? ""}
            onChange={(event) => {
              const next = String(event.target.value);
              setRole(next === "" ? null : (next as UserRole));
            }}
          >
            <MenuItem value="">
              <em>All roles</em>
            </MenuItem>
            {USER_ROLE_OPTIONS.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel id="user-status-filter-label">Status</InputLabel>
          <Select
            labelId="user-status-filter-label"
            id="user-status-filter"
            label="Status"
            value={status ?? ""}
            onChange={(event) => {
              const next = String(event.target.value);
              setStatus(next === "" ? null : (next as UserStatus));
            }}
          >
            <MenuItem value="">
              <em>All statuses</em>
            </MenuItem>
            {USER_STATUS_OPTIONS.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl size="small" sx={{ minWidth: 190 }}>
          <InputLabel id="user-department-filter-label">Department</InputLabel>
          <Select
            labelId="user-department-filter-label"
            id="user-department-filter"
            label="Department"
            value={departmentId ?? ""}
            onChange={(event) => {
              const next = String(event.target.value);
              setDepartmentId(next === "" ? null : next);
            }}
          >
            <MenuItem value="">
              <em>All departments</em>
            </MenuItem>
            {(departmentOptions ?? []).map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <Stack
          direction="row"
          spacing={1}
          sx={{ ml: { md: "auto" }, justifyContent: { xs: "flex-end", md: "flex-start" } }}
        >
          <Button color="inherit" onClick={resetFilters} disabled={!hasFilters}>
            Clear filters
          </Button>
          <Button variant="contained" onClick={onAdd}>
            Add user
          </Button>
        </Stack>
      </Stack>
    </GlassPanel>
  );
}
