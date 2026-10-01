import Dexie, { type EntityTable } from "dexie";
import { SCHEMA, SCHEMA_VERSION } from "./schema";
import type {
  Activity,
  AuditLogEntry,
  Emission,
  EmissionFactor,
  Facility,
  Project,
  Report,
  Supplier,
  Target,
} from "./types";

export class CarbonPortalDB extends Dexie {
  facilities!: EntityTable<Facility, "id">;
  emissionFactors!: EntityTable<EmissionFactor, "id">;
  activities!: EntityTable<Activity, "id">;
  emissions!: EntityTable<Emission, "id">;
  suppliers!: EntityTable<Supplier, "id">;
  targets!: EntityTable<Target, "id">;
  projects!: EntityTable<Project, "id">;
  reports!: EntityTable<Report, "id">;
  auditLog!: EntityTable<AuditLogEntry, "seq">;

  constructor() {
    super("carbon-portal");
    this.version(SCHEMA_VERSION).stores(SCHEMA);
  }
}

/** Single Dexie instance for the Carbon Portal module. */
export const carbonPortalDb = new CarbonPortalDB();
