import { seedIfEmpty } from "../db/seed";

export function ensureSeeded(): Promise<void> {
  return seedIfEmpty();
}
