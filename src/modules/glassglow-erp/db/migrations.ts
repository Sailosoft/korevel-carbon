import type { Transaction } from "dexie";
import type { Department } from "./types";

type LegacyUser = {
  id: string;
  department?: string;
  departmentId?: string;
  [key: string]: unknown;
};

const FALLBACK_DEPARTMENT = "Unassigned";
const FALLBACK_CODE = "DEPT";

function deriveDepartmentCode(name: string, usedCodes: Set<string>): string {
  const base =
    name
      .replace(/[^a-z0-9]/gi, "")
      .toUpperCase()
      .slice(0, 3) || FALLBACK_CODE;
  let code = base;
  let suffix = 2;
  while (usedCodes.has(code)) {
    code = `${base}${suffix}`;
    suffix += 1;
  }
  usedCodes.add(code);
  return code;
}

/** Derives departments from the v1 free-text `user.department` field. */
export async function migrateDepartmentsV2(tx: Transaction): Promise<void> {
  const usersTable = tx.table<LegacyUser, string>("users");
  const departmentsTable = tx.table<Department, string>("departments");
  const users = await usersTable.toArray();
  if (users.length === 0) return;

  const now = new Date().toISOString();
  const byName = new Map<string, Department>();
  const usedCodes = new Set<string>();
  const departments: Department[] = [];
  const assignments = new Map<string, string>();

  const ensureDepartment = (rawName: string | undefined): Department => {
    const name =
      typeof rawName === "string" && rawName.trim() !== "" ? rawName.trim() : FALLBACK_DEPARTMENT;
    const key = name.toLowerCase();
    const existing = byName.get(key);
    if (existing) return existing;

    const department: Department = {
      id: `dpt-${crypto.randomUUID()}`,
      name,
      code: deriveDepartmentCode(name, usedCodes),
      description: "",
      createdAt: now,
      updatedAt: now,
    };
    byName.set(key, department);
    departments.push(department);
    return department;
  };

  for (const user of users) {
    assignments.set(user.id, ensureDepartment(user.department).id);
  }

  await departmentsTable.bulkPut(departments);

  for (const user of users) {
    const departmentId = assignments.get(user.id);
    if (!departmentId) continue;
    const next: LegacyUser = { ...user, departmentId };
    delete next.department;
    await usersTable.put(next);
  }
}
