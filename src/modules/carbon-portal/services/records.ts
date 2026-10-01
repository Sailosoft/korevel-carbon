import type { EntityTable, Table } from "dexie";
import { carbonPortalDb } from "../db/database";
import { SOURCE_TYPE_META } from "../db/sourceTypes";
import type {
  Activity,
  ActivitySourceType,
  AuditEntityType,
  DataQuality,
  EmissionFactor,
  Facility,
  Project,
  Supplier,
  Target,
} from "../db/types";
import { logAudit } from "./auditLog";
import { matchFactor, recalculateActivity, recalculateActivities } from "./calculateEmissions";

export type ActivityInput = {
  id?: string;
  facilityId: string;
  date: string;
  sourceType: ActivitySourceType;
  quantity: number;
  dataQuality: DataQuality;
  supplierId: string | null;
  notes: string | null;
};

/** Creates or updates an activity, resolves its factor and recalculates its emission. */
export async function saveActivity(input: ActivityInput): Promise<Activity> {
  const meta = SOURCE_TYPE_META[input.sourceType];
  const now = new Date().toISOString();
  const existing = input.id ? await carbonPortalDb.activities.get(input.id) : undefined;

  const activity: Activity = {
    id: existing?.id ?? `act-${crypto.randomUUID()}`,
    facilityId: input.facilityId,
    date: input.date,
    scope: meta.scope,
    category: meta.category,
    sourceType: input.sourceType,
    quantity: input.quantity,
    unit: meta.unit,
    supplierId: meta.supportsSupplier ? input.supplierId : null,
    factorId: existing?.factorId ?? "",
    dataQuality: input.dataQuality,
    notes: input.notes,
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
  };

  const [factors, facility] = await Promise.all([
    carbonPortalDb.emissionFactors.toArray(),
    carbonPortalDb.facilities.get(activity.facilityId),
  ]);
  activity.factorId = matchFactor({ activity, facility }, factors)?.id ?? "";

  await carbonPortalDb.activities.put(activity);
  await recalculateActivity(activity, { audit: true });
  await logAudit({
    action: existing ? "update" : "create",
    entityType: "activity",
    entityId: activity.id,
    summary: `${existing ? "Updated" : "Created"} activity ${activity.sourceType} (${activity.quantity} ${activity.unit}) for ${activity.date}`,
  });
  return activity;
}

export async function deleteActivity(id: string): Promise<void> {
  const activity = await carbonPortalDb.activities.get(id);
  if (!activity) return;
  await carbonPortalDb.activities.delete(id);
  await carbonPortalDb.emissions.where("activityId").equals(id).delete();
  await logAudit({
    action: "update",
    entityType: "activity",
    entityId: id,
    summary: `Deleted activity ${activity.sourceType} for ${activity.date}`,
  });
}

export async function recalculateAllActivities(): Promise<number> {
  const activities = await carbonPortalDb.activities.toArray();
  return recalculateActivities(activities, { audit: true });
}

async function upsertWithAudit<T extends { id: string }>(
  table: EntityTable<T, "id">,
  record: T,
  entityType: AuditEntityType,
  summary: (existed: boolean) => string,
): Promise<void> {
  // Widens the generic key to string so lookups type-check for every entity.
  const keyed = table as unknown as Table<T, string>;
  const existed = (await keyed.get(record.id)) !== undefined;
  await keyed.put(record);
  await logAudit({
    action: existed ? "update" : "create",
    entityType,
    entityId: record.id,
    summary: summary(existed),
  });
}

async function removeWithAudit<T extends { id: string; name: string }>(
  table: EntityTable<T, "id">,
  id: string,
  entityType: AuditEntityType,
  label: string,
): Promise<void> {
  const keyed = table as unknown as Table<T, string>;
  const record = await keyed.get(id);
  await keyed.delete(id);
  if (record) {
    await logAudit({
      action: "update",
      entityType,
      entityId: id,
      summary: `Deleted ${label} "${record.name}"`,
    });
  }
}

export async function saveSupplier(record: Supplier): Promise<void> {
  await upsertWithAudit(
    carbonPortalDb.suppliers,
    record,
    "supplier",
    (existed) => `${existed ? "Updated" : "Created"} supplier "${record.name}"`,
  );
}

export function deleteSupplier(id: string): Promise<void> {
  return removeWithAudit(carbonPortalDb.suppliers, id, "supplier", "supplier");
}

export async function saveTarget(record: Target): Promise<void> {
  await upsertWithAudit(
    carbonPortalDb.targets,
    record,
    "target",
    (existed) => `${existed ? "Updated" : "Created"} target "${record.name}"`,
  );
}

export function deleteTarget(id: string): Promise<void> {
  return removeWithAudit(carbonPortalDb.targets, id, "target", "target");
}

export async function saveProject(record: Project): Promise<void> {
  await upsertWithAudit(
    carbonPortalDb.projects,
    record,
    "project",
    (existed) => `${existed ? "Updated" : "Created"} project "${record.name}"`,
  );
}

export function deleteProject(id: string): Promise<void> {
  return removeWithAudit(carbonPortalDb.projects, id, "project", "project");
}

export async function saveFacility(record: Facility): Promise<void> {
  await upsertWithAudit(
    carbonPortalDb.facilities,
    record,
    "facility",
    (existed) => `${existed ? "Updated" : "Created"} facility "${record.name}"`,
  );
}

export function deleteFacility(id: string): Promise<void> {
  return removeWithAudit(carbonPortalDb.facilities, id, "facility", "facility");
}

export async function saveFactor(record: EmissionFactor): Promise<void> {
  await upsertWithAudit(
    carbonPortalDb.emissionFactors,
    record,
    "factor",
    (existed) => `${existed ? "Updated" : "Created"} emission factor "${record.key}"`,
  );
}

export async function deleteFactor(id: string): Promise<void> {
  const record = await carbonPortalDb.emissionFactors.get(id);
  await carbonPortalDb.emissionFactors.delete(id);
  if (record) {
    await logAudit({
      action: "update",
      entityType: "factor",
      entityId: id,
      summary: `Deleted emission factor "${record.key}"`,
    });
  }
}
