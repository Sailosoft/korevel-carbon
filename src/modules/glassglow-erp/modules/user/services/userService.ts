import { glassglowDb } from "../../../db/database";
import type { User } from "../../../db/types";
import { isValidEmail, normalizeEmail, requiredText } from "../../../lib/validation";
import type { UserInput } from "../types";

async function findEmailOwner(email: string, excludeId?: string): Promise<User | undefined> {
  const match = await glassglowDb.users.where("email").equals(email).first();
  return match && match.id !== excludeId ? match : undefined;
}

export async function saveUser(input: UserInput): Promise<User> {
  const name = requiredText(input.name, "Name");
  const email = normalizeEmail(input.email);
  const departmentId = requiredText(input.departmentId, "Department");

  if (!isValidEmail(email)) {
    throw new Error("Enter a valid email address.");
  }

  return glassglowDb.transaction(
    "rw",
    glassglowDb.users,
    glassglowDb.departments,
    async () => {
      const department = await glassglowDb.departments.get(departmentId);
      if (!department) {
        throw new Error("Select a valid department.");
      }

      const now = new Date().toISOString();

      if (input.id) {
        const existing = await glassglowDb.users.get(input.id);
        if (!existing) {
          throw new Error("This user no longer exists.");
        }

        const duplicate = await findEmailOwner(email, input.id);
        if (duplicate) {
          throw new Error(`A user with ${email} already exists.`);
        }

        const updated: User = {
          ...existing,
          name,
          email,
          role: input.role,
          status: input.status,
          departmentId,
          updatedAt: now,
        };
        await glassglowDb.users.put(updated);
        return updated;
      }

      const duplicate = await findEmailOwner(email);
      if (duplicate) {
        throw new Error(`A user with ${email} already exists.`);
      }

      const created: User = {
        id: `usr-${crypto.randomUUID()}`,
        name,
        email,
        role: input.role,
        status: input.status,
        departmentId,
        lastActiveAt: input.status === "active" ? now : null,
        createdAt: now,
        updatedAt: now,
      };
      await glassglowDb.users.add(created);
      return created;
    },
  );
}

export async function deleteUser(id: string): Promise<void> {
  await glassglowDb.users.delete(id);
}
