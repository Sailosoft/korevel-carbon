import type { Department, User } from "../../../db/types";
import type { DepartmentFilters, DepartmentWithCount } from "../types";

export function sortDepartmentsByName(departments: Department[]): Department[] {
  return [...departments].sort((a, b) => a.name.localeCompare(b.name));
}

export function filterDepartments<T extends Department>(
  departments: T[],
  filters: DepartmentFilters,
): T[] {
  const needle = filters.search.trim().toLowerCase();
  if (needle === "") return departments;

  return departments.filter((department) =>
    [department.name, department.code, department.description].some((value) =>
      value.toLowerCase().includes(needle),
    ),
  );
}

export function countMembersByDepartment(users: User[]): Map<string, number> {
  const counts = new Map<string, number>();
  for (const user of users) {
    counts.set(user.departmentId, (counts.get(user.departmentId) ?? 0) + 1);
  }
  return counts;
}

export function attachMemberCounts(
  departments: Department[],
  counts: Map<string, number>,
): DepartmentWithCount[] {
  return departments.map((department) => ({
    ...department,
    memberCount: counts.get(department.id) ?? 0,
  }));
}
