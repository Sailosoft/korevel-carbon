import { useLiveQuery } from "dexie-react-hooks";
import { glassglowDb } from "../../../db/database";
import type { Department } from "../../../db/types";
import {
  attachMemberCounts,
  countMembersByDepartment,
  sortDepartmentsByName,
} from "../services/departmentStats";
import type { DepartmentOption, DepartmentWithCount } from "../types";

export function useDepartments(): Department[] | undefined {
  return useLiveQuery(async () => sortDepartmentsByName(await glassglowDb.departments.toArray()), []);
}

export function useDepartmentsWithCounts(): DepartmentWithCount[] | undefined {
  return useLiveQuery(async () => {
    const [departments, users] = await Promise.all([
      glassglowDb.departments.toArray(),
      glassglowDb.users.toArray(),
    ]);
    const counts = countMembersByDepartment(users);
    return attachMemberCounts(sortDepartmentsByName(departments), counts);
  }, []);
}

export function useDepartmentOptions(): DepartmentOption[] | undefined {
  return useLiveQuery(async () => {
    const departments = await glassglowDb.departments.toArray();
    return sortDepartmentsByName(departments).map((department) => ({
      value: department.id,
      label: `${department.code} — ${department.name}`,
    }));
  }, []);
}
