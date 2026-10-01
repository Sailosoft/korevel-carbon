import { STORE } from "./indexes";

/** Single schema version: this is a mock database, there are no migrations. */
export const SCHEMA_VERSION = 1;

export const SCHEMA: Record<keyof typeof STORE, string> = {
  [STORE.facilities]: "id, &code, country, isActive",
  [STORE.emissionFactors]: "id, &key, scope, category, source, [scope+category]",
  [STORE.activities]: "id, facilityId, date, scope, sourceType, category, [facilityId+date]",
  [STORE.emissions]: "id, &activityId, facilityId, scope, date, [scope+date]",
  [STORE.suppliers]: "id, category, country, rating",
  [STORE.targets]: "id, status, scope",
  [STORE.projects]: "id, status, facilityId, targetId",
  [STORE.reports]: "id, status, periodStart",
  [STORE.auditLog]: "++seq, at, entityType, [entityType+entityId]",
};
