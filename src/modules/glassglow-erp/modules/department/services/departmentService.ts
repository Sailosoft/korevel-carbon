import { glassglowDb } from "../../../db/database";
import type { Department } from "../../../db/types";
import { requiredText } from "../../../lib/validation";
import { DEPARTMENT_CODE_PATTERN, type DepartmentInput } from "../types";

function findDuplicate(
  departments: Department[],
  name: string,
  code: string,
  excludeId?: string,
): Department | undefined {
  return departments.find(
    (department) =>
      department.id !== excludeId &&
      (department.name.toLowerCase() === name.toLowerCase() || department.code === code),
  );
}

export async function saveDepartment(input: DepartmentInput): Promise<Department> {
  const name = requiredText(input.name, "Department name");
  const code = requiredText(input.code, "Code").toUpperCase();
  const description = input.description.trim();

  if (!DEPARTMENT_CODE_PATTERN.test(code)) {
    throw new Error("Code must be 2–10 letters or digits and start with a letter.");
  }

  return glassglowDb.transaction("rw", glassglowDb.departments, async () => {
    const departments = await glassglowDb.departments.toArray();
    const duplicate = findDuplicate(departments, name, code, input.id);

    if (duplicate) {
      if (duplicate.name.toLowerCase() === name.toLowerCase()) {
        throw new Error(`A department named ${name} already exists.`);
      }
      throw new Error(`Department code ${code} is already in use.`);
    }

    const now = new Date().toISOString();

    if (input.id) {
      const existing = await glassglowDb.departments.get(input.id);
      if (!existing) {
        throw new Error("This department no longer exists.");
      }

      const updated: Department = {
        ...existing,
        name,
        code,
        description,
        updatedAt: now,
      };
      await glassglowDb.departments.put(updated);
      return updated;
    }

    const created: Department = {
      id: `dpt-${crypto.randomUUID()}`,
      name,
      code,
      description,
      createdAt: now,
      updatedAt: now,
    };
    await glassglowDb.departments.add(created);
    return created;
  });
}

export async function deleteDepartment(id: string): Promise<void> {
  await glassglowDb.transaction(
    "rw",
    glassglowDb.departments,
    glassglowDb.users,
    async () => {
      const department = await glassglowDb.departments.get(id);
      if (!department) {
        throw new Error("This department no longer exists.");
      }

      const assigned = await glassglowDb.users.where("departmentId").equals(id).count();
      if (assigned > 0) {
        throw new Error(
          `Cannot delete ${department.name}: ${assigned} user(s) are still assigned. Reassign them first.`,
        );
      }

      await glassglowDb.departments.delete(id);
    },
  );
}
