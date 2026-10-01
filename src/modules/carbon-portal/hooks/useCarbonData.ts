import { useLiveQuery } from "dexie-react-hooks";
import { carbonPortalDb } from "../db/database";
import { sourceLabel } from "../db/sourceTypes";
import type {
  Activity,
  ActivitySourceType,
  DataQuality,
  Emission,
  EmissionFactor,
  EmissionMethod,
  Facility,
  Project,
  Report,
  Scope,
  Supplier,
  Target,
  AuditLogEntry,
} from "../db/types";
import {
  computeFacilityLeaderboard,
  computeHotspots,
  computeMonthlyTrend,
  computeOverviewKpis,
  computeScopeBreakdown,
  computeTargetProgress,
  type FacilityLeaderboardItem,
  type HotspotItem,
  type MonthlyTrendItem,
  type OverviewKpis,
  type ScopeBreakdownItem,
  type TargetProgressItem,
} from "../services/aggregates";

// --- Per-model live queries -------------------------------------------------

export function useFacilities(): Facility[] | undefined {
  return useLiveQuery(() => carbonPortalDb.facilities.orderBy("code").toArray(), []);
}

export function useEmissionFactors(): EmissionFactor[] | undefined {
  return useLiveQuery(() => carbonPortalDb.emissionFactors.orderBy("key").toArray(), []);
}

export function useActivities(): Activity[] | undefined {
  return useLiveQuery(() => carbonPortalDb.activities.orderBy("date").reverse().toArray(), []);
}

export function useEmissions(): Emission[] | undefined {
  return useLiveQuery(() => carbonPortalDb.emissions.toArray(), []);
}

export function useSuppliers(): Supplier[] | undefined {
  return useLiveQuery(async () => {
    const suppliers = await carbonPortalDb.suppliers.toArray();
    return suppliers.sort((a, b) => a.name.localeCompare(b.name));
  }, []);
}

export function useTargets(): Target[] | undefined {
  return useLiveQuery(async () => {
    const targets = await carbonPortalDb.targets.toArray();
    return targets.sort((a, b) => a.targetYear - b.targetYear);
  }, []);
}

export function useProjects(): Project[] | undefined {
  return useLiveQuery(async () => {
    const projects = await carbonPortalDb.projects.toArray();
    return projects.sort((a, b) => a.startAt.localeCompare(b.startAt));
  }, []);
}

export function useReports(): Report[] | undefined {
  return useLiveQuery(async () => {
    const reports = await carbonPortalDb.reports.toArray();
    return reports.sort((a, b) => b.generatedAt.localeCompare(a.generatedAt));
  }, []);
}

export function useAuditLog(): AuditLogEntry[] | undefined {
  return useLiveQuery(() => carbonPortalDb.auditLog.orderBy("at").reverse().limit(50).toArray(), []);
}

// --- Derived view models ----------------------------------------------------

export function useOverviewKpis(): OverviewKpis | undefined {
  return useLiveQuery(async () => {
    const [emissions, facilities, activities, projects] = await Promise.all([
      carbonPortalDb.emissions.toArray(),
      carbonPortalDb.facilities.toArray(),
      carbonPortalDb.activities.toArray(),
      carbonPortalDb.projects.toArray(),
    ]);
    return computeOverviewKpis({ emissions, facilities, activities, projects });
  }, []);
}

export function useScopeBreakdown(): ScopeBreakdownItem[] | undefined {
  return useLiveQuery(async () => {
    const emissions = await carbonPortalDb.emissions.toArray();
    return computeScopeBreakdown(emissions);
  }, []);
}

export function useMonthlyTrend(): MonthlyTrendItem[] | undefined {
  return useLiveQuery(async () => {
    const emissions = await carbonPortalDb.emissions.toArray();
    return computeMonthlyTrend(emissions);
  }, []);
}

export function useFacilityLeaderboard(): FacilityLeaderboardItem[] | undefined {
  return useLiveQuery(async () => {
    const [emissions, facilities] = await Promise.all([
      carbonPortalDb.emissions.toArray(),
      carbonPortalDb.facilities.toArray(),
    ]);
    return computeFacilityLeaderboard(emissions, facilities);
  }, []);
}

export function useTargetProgress(): TargetProgressItem[] | undefined {
  return useLiveQuery(async () => {
    const [emissions, targets] = await Promise.all([
      carbonPortalDb.emissions.toArray(),
      carbonPortalDb.targets.toArray(),
    ]);
    return computeTargetProgress(emissions, targets);
  }, []);
}

export function useHotspotTable(): HotspotItem[] | undefined {
  return useLiveQuery(async () => {
    const [emissions, activities] = await Promise.all([
      carbonPortalDb.emissions.toArray(),
      carbonPortalDb.activities.toArray(),
    ]);
    return computeHotspots(emissions, activities);
  }, []);
}

// --- Joined read models -----------------------------------------------------

export type EmissionRow = {
  id: string;
  date: string;
  facilityId: string;
  facilityName: string;
  scope: Scope;
  sourceType: ActivitySourceType;
  sourceLabel: string;
  category: string;
  quantity: number;
  unit: string;
  co2eTonnes: number;
  method: EmissionMethod;
  dataQuality: DataQuality;
  factorActivity: string | null;
  factorSource: string | null;
  supplierName: string | null;
  notes: string | null;
  activity: Activity;
};

async function loadJoinedRows(): Promise<EmissionRow[]> {
  const [activities, emissions, facilities, factors, suppliers] = await Promise.all([
    carbonPortalDb.activities.toArray(),
    carbonPortalDb.emissions.toArray(),
    carbonPortalDb.facilities.toArray(),
    carbonPortalDb.emissionFactors.toArray(),
    carbonPortalDb.suppliers.toArray(),
  ]);

  const emissionByActivity = new Map(emissions.map((emission) => [emission.activityId, emission]));
  const facilityById = new Map(facilities.map((facility) => [facility.id, facility]));
  const factorById = new Map(factors.map((factor) => [factor.id, factor]));
  const supplierById = new Map(suppliers.map((supplier) => [supplier.id, supplier]));

  return activities
    .map((activity): EmissionRow => {
      const emission = emissionByActivity.get(activity.id);
      const factor = factorById.get(activity.factorId);
      const facility = facilityById.get(activity.facilityId);
      return {
        id: activity.id,
        date: activity.date,
        facilityId: activity.facilityId,
        facilityName: facility?.name ?? activity.facilityId,
        scope: activity.scope,
        sourceType: activity.sourceType,
        sourceLabel: sourceLabel(activity.sourceType),
        category: activity.category,
        quantity: activity.quantity,
        unit: activity.unit,
        co2eTonnes: emission?.co2eTonnes ?? 0,
        method: emission?.method ?? "factor_based",
        dataQuality: activity.dataQuality,
        factorActivity: factor?.activity ?? null,
        factorSource: factor ? `${factor.source} ${factor.vintageYear}` : null,
        supplierName:
          activity.supplierId != null
            ? (supplierById.get(activity.supplierId)?.name ?? null)
            : null,
        notes: activity.notes,
        activity,
      };
    })
    .sort((a, b) => b.date.localeCompare(a.date) || a.facilityName.localeCompare(b.facilityName));
}

/** Activity + emission rows for the DataGrid screens. */
export function useEmissionRows(): EmissionRow[] | undefined {
  return useLiveQuery(loadJoinedRows, []);
}

/** Distinct months present in the data, newest first (filter select options). */
export function useEmissionMonths(): string[] | undefined {
  return useLiveQuery(async () => {
    const emissions = await carbonPortalDb.emissions.toArray();
    return Array.from(new Set(emissions.map((emission) => emission.date))).sort().reverse();
  }, []);
}
