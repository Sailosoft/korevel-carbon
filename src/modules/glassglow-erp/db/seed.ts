import { glassglowDb } from "./database";
import { SEED_DEPARTMENTS, SEED_USERS } from "./seedData";

let seedInFlight: Promise<void> | null = null;

/**
 * Seeds the demo dataset exactly once. Concurrent callers (multiple mounts,
 * StrictMode) share the same promise; failures allow a retry.
 */
export function seedIfEmpty(): Promise<void> {
  if (!seedInFlight) {
    seedInFlight = runSeed().catch((error) => {
      seedInFlight = null;
      throw error;
    });
  }
  return seedInFlight;
}

async function runSeed(): Promise<void> {
  await glassglowDb.open();
  const [departmentCount, userCount] = await Promise.all([
    glassglowDb.departments.count(),
    glassglowDb.users.count(),
  ]);
  if (departmentCount > 0 || userCount > 0) return;

  await glassglowDb.transaction("rw", glassglowDb.departments, glassglowDb.users, async () => {
    await glassglowDb.departments.bulkPut(SEED_DEPARTMENTS);
    await glassglowDb.users.bulkPut(SEED_USERS);
  });
}
