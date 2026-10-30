import Dexie, { type EntityTable } from "dexie";
import { migrateDepartmentsV2 } from "./migrations";
import { LEGACY_SCHEMA_V1, SCHEMA, SCHEMA_VERSION } from "./schema";
import type { Department, User } from "./types";

export class GlassglowDB extends Dexie {
  users!: EntityTable<User, "id">;
  departments!: EntityTable<Department, "id">;

  constructor() {
    super("glassglow-erp");
    this.version(1).stores(LEGACY_SCHEMA_V1);
    this.version(SCHEMA_VERSION).stores(SCHEMA).upgrade(migrateDepartmentsV2);
  }
}

/** Single Dexie instance for the Glassglow ERP module. */
export const glassglowDb = new GlassglowDB();
