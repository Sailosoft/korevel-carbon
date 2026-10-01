import { carbonPortalDb } from "../db/database";
import { factorKeyFor } from "../db/sourceTypes";
import type { Activity, Emission, EmissionFactor, Facility } from "../db/types";
import { logAudit } from "./auditLog";

export type FactorMatchInput = {
  activity: Pick<Activity, "sourceType" | "category" | "unit" | "scope">;
  facility?: Facility | undefined;
};

/**
 * Matches an activity to its emission factor: first by canonical factor key
 * (region-aware for grid electricity), then by category + unit + scope,
 * narrowed by facility country when several regional candidates exist.
 */
export function matchFactor(
  input: FactorMatchInput,
  factors: EmissionFactor[],
): EmissionFactor | undefined {
  const { activity, facility } = input;

  const key = factorKeyFor(activity.sourceType, facility?.country);
  if (key) {
    const byKey = factors.find((factor) => factor.key === key);
    if (byKey && byKey.category === activity.category && byKey.unit === activity.unit) {
      return byKey;
    }
  }

  const candidates = factors.filter(
    (factor) =>
      factor.category === activity.category &&
      factor.unit === activity.unit &&
      factor.scope === activity.scope,
  );
  if (candidates.length === 0) return undefined;
  if (candidates.length === 1) return candidates[0];

  const regional = candidates.filter((factor) => factor.region === facility?.country);
  if (regional.length > 0) return regional[0];
  const global = candidates.find((factor) => factor.region === null);
  return global ?? candidates[0];
}

export type EmissionValues = {
  co2eKg: number;
  co2eTonnes: number;
  method: "factor_based" | "spend_based";
};

export function computeEmissionValues(activity: Activity, factor: EmissionFactor): EmissionValues {
  const co2eKg = activity.quantity * factor.co2ePerUnit;
  const co2eTonnes = Math.round((co2eKg / 1000) * 1000) / 1000;
  const method = activity.dataQuality === "spend_based" ? "spend_based" : "factor_based";
  return { co2eKg, co2eTonnes, method };
}

function buildEmission(activity: Activity, values: EmissionValues): Emission {
  return {
    id: `em-${activity.id}`,
    activityId: activity.id,
    facilityId: activity.facilityId,
    date: activity.date,
    scope: activity.scope,
    co2eKg: values.co2eKg,
    co2eTonnes: values.co2eTonnes,
    method: values.method,
    calculatedAt: new Date().toISOString(),
  };
}

/** Recomputes the cached emission for a single activity (delete + reinsert). */
export async function recalculateActivity(
  activity: Activity,
  options: { audit?: boolean } = {},
): Promise<Emission | undefined> {
  const [factors, facility] = await Promise.all([
    carbonPortalDb.emissionFactors.toArray(),
    carbonPortalDb.facilities.get(activity.facilityId),
  ]);
  const factor = matchFactor({ activity, facility }, factors);

  await carbonPortalDb.emissions.where("activityId").equals(activity.id).delete();
  if (!factor) return undefined;

  const emission = buildEmission(activity, computeEmissionValues(activity, factor));
  await carbonPortalDb.emissions.put(emission);

  if (options.audit) {
    await logAudit({
      action: "recalculate",
      entityType: "emission",
      entityId: emission.id,
      summary: `Recalculated ${emission.co2eTonnes.toFixed(3)} t CO2e for activity ${activity.id}`,
    });
  }
  return emission;
}

/** Batch recalculation used by seeding and the settings "recalculate all" action. */
export async function recalculateActivities(
  activities: Activity[],
  options: { audit?: boolean } = {},
): Promise<number> {
  if (activities.length === 0) return 0;

  const [factors, facilities] = await Promise.all([
    carbonPortalDb.emissionFactors.toArray(),
    carbonPortalDb.facilities.toArray(),
  ]);
  const facilityById = new Map(facilities.map((facility) => [facility.id, facility]));

  const emissions: Emission[] = [];
  for (const activity of activities) {
    const factor = matchFactor(
      { activity, facility: facilityById.get(activity.facilityId) },
      factors,
    );
    if (factor) emissions.push(buildEmission(activity, computeEmissionValues(activity, factor)));
  }

  await carbonPortalDb.emissions
    .where("activityId")
    .anyOf(activities.map((activity) => activity.id))
    .delete();
  await carbonPortalDb.emissions.bulkPut(emissions);

  if (options.audit) {
    await logAudit({
      action: "recalculate",
      entityType: "emission",
      entityId: "batch",
      summary: `Recalculated ${emissions.length} emissions`,
    });
  }
  return emissions.length;
}
