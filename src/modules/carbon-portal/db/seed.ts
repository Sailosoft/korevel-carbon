import { computeReportSnapshot } from "../services/aggregates";
import { computeEmissionValues, matchFactor } from "../services/calculateEmissions";
import { carbonPortalDb } from "./database";
import { buildSeedData, SEED_GENERATED_AT } from "./seedData";
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

let seedInFlight: Promise<void> | null = null;

/**
 * Seeds deterministic mock data exactly once. Concurrent callers (multiple
 * mounts, StrictMode) share the same promise; failures allow a retry.
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

const seededTables = () => [
  carbonPortalDb.facilities,
  carbonPortalDb.emissionFactors,
  carbonPortalDb.activities,
  carbonPortalDb.emissions,
  carbonPortalDb.suppliers,
  carbonPortalDb.targets,
  carbonPortalDb.projects,
  carbonPortalDb.reports,
  carbonPortalDb.auditLog,
];

type ExpectedShapeInput = {
  facilities: Facility[];
  emissionFactors: EmissionFactor[];
  activities: Activity[];
  emissions: Emission[];
  suppliers: Supplier[];
  targets: Target[];
  projects: Project[];
  reports: Pick<Report, "generatedAt">[];
  auditLog: AuditLogEntry[];
};

/**
 * True when rows carry every field the UI sorts and joins on. Guards against
 * mock data (seed or rows left by earlier iterations of this schema) that would
 * crash screens; there are no migrations by design, so bad rows are replaced
 * by a fresh seed rather than repaired.
 */
function hasExpectedShape(rows: ExpectedShapeInput): boolean {
  return (
    rows.facilities.length > 0 &&
    rows.facilities.every((facility) => typeof facility.name === "string" && typeof facility.code === "string") &&
    rows.emissionFactors.every((factor) => typeof factor.key === "string") &&
    rows.activities.every((activity) => typeof activity.date === "string" && typeof activity.facilityId === "string") &&
    rows.emissions.every((emission) => typeof emission.date === "string" && typeof emission.co2eTonnes === "number") &&
    rows.suppliers.every((supplier) => typeof supplier.name === "string") &&
    rows.targets.every((target) => typeof target.targetYear === "number") &&
    rows.projects.every((project) => typeof project.startAt === "string") &&
    rows.reports.every((report) => typeof report.generatedAt === "string") &&
    rows.auditLog.every((entry) => typeof entry.at === "string")
  );
}

async function storedDataHasExpectedShape(): Promise<boolean> {
  const [facilities, emissionFactors, activities, emissions, suppliers, targets, projects, reports, auditLog] =
    await Promise.all([
      carbonPortalDb.facilities.toArray(),
      carbonPortalDb.emissionFactors.toArray(),
      carbonPortalDb.activities.toArray(),
      carbonPortalDb.emissions.toArray(),
      carbonPortalDb.suppliers.toArray(),
      carbonPortalDb.targets.toArray(),
      carbonPortalDb.projects.toArray(),
      carbonPortalDb.reports.toArray(),
      carbonPortalDb.auditLog.toArray(),
    ]);
  return hasExpectedShape({
    facilities,
    emissionFactors,
    activities,
    emissions,
    suppliers,
    targets,
    projects,
    reports,
    auditLog,
  });
}

async function runSeed(): Promise<void> {
  await carbonPortalDb.open();

  if (await storedDataHasExpectedShape()) return;

  await carbonPortalDb.transaction("rw", seededTables(), async () => {
    const bundle = buildSeedData();
    const facilityById = new Map(bundle.facilities.map((facility) => [facility.id, facility]));

    // Emissions are always derived from activity x factor, never hand-written.
    const emissions: Emission[] = [];
    for (const activity of bundle.activities) {
      const factor = matchFactor(
        { activity, facility: facilityById.get(activity.facilityId) },
        bundle.emissionFactors,
      );
      if (!factor) continue;
      emissions.push({
        id: `em-${activity.id}`,
        activityId: activity.id,
        facilityId: activity.facilityId,
        date: activity.date,
        scope: activity.scope,
        ...computeEmissionValues(activity, factor),
        calculatedAt: SEED_GENERATED_AT,
      });
    }

    const reports = bundle.reports.map((report) => ({
      ...report,
      ...computeReportSnapshot(emissions, report.periodStart, report.periodEnd),
    }));

    if (!hasExpectedShape({ ...bundle, emissions, reports })) {
      throw new Error("Seed bundle is missing required fields; refusing to write mock data");
    }

    await Promise.all(seededTables().map((table) => table.clear()));

    await carbonPortalDb.facilities.bulkPut(bundle.facilities);
    await carbonPortalDb.emissionFactors.bulkPut(bundle.emissionFactors);
    await carbonPortalDb.suppliers.bulkPut(bundle.suppliers);
    await carbonPortalDb.targets.bulkPut(bundle.targets);
    await carbonPortalDb.projects.bulkPut(bundle.projects);
    await carbonPortalDb.activities.bulkPut(bundle.activities);
    await carbonPortalDb.emissions.bulkPut(emissions);
    await carbonPortalDb.reports.bulkPut(reports);
    await carbonPortalDb.auditLog.bulkAdd(bundle.auditLog);
  });
}
