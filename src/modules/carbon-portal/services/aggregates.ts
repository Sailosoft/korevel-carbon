import { addMonths, currentMonth, monthRange, monthsBetween } from "../lib/months";
import { deltaPct, roundTo, safePct } from "../lib/format";
import type {
  Activity,
  ActivitySourceType,
  Emission,
  Facility,
  Project,
  Scope,
  Target,
  TargetScope,
} from "../db/types";
import { sourceLabel } from "../db/sourceTypes";

export type MonthWindow = {
  start: string;
  end: string;
  months: string[];
};

export type OverviewKpis = {
  window: MonthWindow;
  totalTonnes: number;
  yoyDeltaPct: number;
  scope1: number;
  scope2: number;
  scope3: number;
  intensityPerM2: number;
  activeProjects: number;
  dataQualityPct: number;
};

export type ScopeBreakdownItem = {
  scope: Scope;
  tonnes: number;
  pctOfTotal: number;
};

export type MonthlyTrendItem = {
  month: string;
  scope1: number;
  scope2: number;
  scope3: number;
  total: number;
};

export type FacilityLeaderboardItem = {
  facilityId: string;
  name: string;
  tonnes: number;
  intensityPerM2: number;
  yoyDeltaPct: number;
};

export type TargetProgressItem = {
  targetId: string;
  name: string;
  scope: TargetScope;
  status: Target["status"];
  targetYear: number;
  currentTonnes: number;
  targetTonnes: number;
  pctToTarget: number;
  onTrack: boolean;
  projectionTonnes: number;
};

export type HotspotItem = {
  sourceType: ActivitySourceType;
  label: string;
  tonnes: number;
  pctOfTotal: number;
  trendPct: number;
};

export type ReportSnapshot = {
  scope1Tonnes: number;
  scope2Tonnes: number;
  scope3Tonnes: number;
  totalTonnes: number;
};

const ROLLING_WINDOW = 12;

/** Latest 12 months covered by the emission data (zero-filled trend window). */
export function resolveWindow(emissions: Emission[]): MonthWindow {
  const latest = emissions.reduce<string | null>(
    (acc, emission) => (acc === null || emission.date > acc ? emission.date : acc),
    null,
  );
  const end = latest ?? currentMonth();
  const start = addMonths(end, -(ROLLING_WINDOW - 1));
  return { start, end, months: monthRange(start, end) };
}

function sumTonnes(emissions: Emission[], predicate: (emission: Emission) => boolean): number {
  let total = 0;
  for (const emission of emissions) {
    if (predicate(emission)) total += emission.co2eTonnes;
  }
  return total;
}

function inMonths(monthsSet: Set<string>) {
  return (emission: Emission) => monthsSet.has(emission.date);
}

/**
 * Year-on-year delta when a prior-year window exists, otherwise the second
 * half of the window compared against the first half (seeded data covers a
 * single rolling year).
 */
function changeDeltaPct(
  emissions: Emission[],
  window: MonthWindow,
  predicate: (emission: Emission) => boolean = () => true,
): number {
  const priorMonths = new Set(window.months.map((month) => addMonths(month, -12)));
  const priorTotal = sumTonnes(
    emissions,
    (emission) => priorMonths.has(emission.date) && predicate(emission),
  );
  if (priorTotal > 0) {
    const currentTotal = sumTonnes(
      emissions,
      (emission) => window.months.includes(emission.date) && predicate(emission),
    );
    return roundTo(deltaPct(currentTotal, priorTotal), 1);
  }

  const firstHalf = window.months.slice(0, 6);
  const secondHalf = window.months.slice(6);
  const h1 = sumTonnes(
    emissions,
    (emission) => firstHalf.includes(emission.date) && predicate(emission),
  );
  const h2 = sumTonnes(
    emissions,
    (emission) => secondHalf.includes(emission.date) && predicate(emission),
  );
  return roundTo(deltaPct(h2, h1), 1);
}

export function computeOverviewKpis(input: {
  emissions: Emission[];
  facilities: Facility[];
  activities: Activity[];
  projects: Project[];
}): OverviewKpis {
  const window = resolveWindow(input.emissions);
  const monthsSet = new Set(window.months);
  const inWindow = inMonths(monthsSet);

  const scope1 = sumTonnes(input.emissions, (e) => inWindow(e) && e.scope === 1);
  const scope2 = sumTonnes(input.emissions, (e) => inWindow(e) && e.scope === 2);
  const scope3 = sumTonnes(input.emissions, (e) => inWindow(e) && e.scope === 3);
  const totalTonnes = scope1 + scope2 + scope3;

  const floorArea = input.facilities.reduce(
    (sum, facility) => sum + (facility.floorAreaM2 ?? 0),
    0,
  );
  const windowActivities = input.activities.filter((activity) => monthsSet.has(activity.date));
  const primaryCount = windowActivities.filter(
    (activity) => activity.dataQuality === "primary",
  ).length;

  return {
    window,
    totalTonnes,
    yoyDeltaPct: changeDeltaPct(input.emissions, window),
    scope1,
    scope2,
    scope3,
    intensityPerM2: floorArea > 0 ? roundTo(totalTonnes / floorArea, 3) : 0,
    activeProjects: input.projects.filter(
      (project) => project.status === "proposed" || project.status === "in_progress",
    ).length,
    dataQualityPct: roundTo(safePct(primaryCount, windowActivities.length), 1),
  };
}

export function computeScopeBreakdown(emissions: Emission[]): ScopeBreakdownItem[] {
  const window = resolveWindow(emissions);
  const monthsSet = new Set(window.months);
  const tonnesByScope = [1, 2, 3].map(
    (scope) =>
      sumTonnes(emissions, (e) => monthsSet.has(e.date) && e.scope === (scope as Scope)),
  );
  const total = tonnesByScope.reduce((sum, value) => sum + value, 0);
  return [1, 2, 3].map((scope, index) => ({
    scope: scope as Scope,
    tonnes: tonnesByScope[index],
    pctOfTotal: roundTo(safePct(tonnesByScope[index], total), 1),
  }));
}

export function computeMonthlyTrend(emissions: Emission[]): MonthlyTrendItem[] {
  const window = resolveWindow(emissions);
  return window.months.map((month) => {
    let scope1 = 0;
    let scope2 = 0;
    let scope3 = 0;
    for (const emission of emissions) {
      if (emission.date !== month) continue;
      if (emission.scope === 1) scope1 += emission.co2eTonnes;
      else if (emission.scope === 2) scope2 += emission.co2eTonnes;
      else scope3 += emission.co2eTonnes;
    }
    return { month, scope1, scope2, scope3, total: scope1 + scope2 + scope3 };
  });
}

export function computeFacilityLeaderboard(
  emissions: Emission[],
  facilities: Facility[],
): FacilityLeaderboardItem[] {
  const window = resolveWindow(emissions);
  return facilities
    .map((facility) => {
      const forFacility = (emission: Emission) => emission.facilityId === facility.id;
      const tonnes = sumTonnes(
        emissions,
        (e) => forFacility(e) && window.months.includes(e.date),
      );
      return {
        facilityId: facility.id,
        name: facility.name,
        tonnes,
        intensityPerM2:
          facility.floorAreaM2 && facility.floorAreaM2 > 0
            ? roundTo(tonnes / facility.floorAreaM2, 3)
            : 0,
        yoyDeltaPct: changeDeltaPct(emissions, window, forFacility),
      };
    })
    .sort((a, b) => b.tonnes - a.tonnes);
}

function matchesTargetScope(targetScope: TargetScope, emissionScope: Scope): boolean {
  switch (targetScope) {
    case "1":
      return emissionScope === 1;
    case "2":
      return emissionScope === 2;
    case "3":
      return emissionScope === 3;
    case "1+2":
      return emissionScope === 1 || emissionScope === 2;
    case "1+2+3":
      return true;
  }
}

function leastSquaresSlope(values: number[]): number {
  const n = values.length;
  if (n < 2) return 0;
  const xMean = (n - 1) / 2;
  const yMean = values.reduce((sum, value) => sum + value, 0) / n;
  let numerator = 0;
  let denominator = 0;
  values.forEach((value, index) => {
    numerator += (index - xMean) * (value - yMean);
    denominator += (index - xMean) ** 2;
  });
  return denominator === 0 ? 0 : numerator / denominator;
}

export function computeTargetProgress(
  emissions: Emission[],
  targets: Target[],
): TargetProgressItem[] {
  const window = resolveWindow(emissions);
  const monthsSet = new Set(window.months);

  return targets.map((target) => {
    const relevant = emissions.filter(
      (emission) => monthsSet.has(emission.date) && matchesTargetScope(target.scope, emission.scope),
    );
    const currentTonnes = relevant.reduce((sum, emission) => sum + emission.co2eTonnes, 0);
    const monthlySeries = window.months.map((month) =>
      relevant
        .filter((emission) => emission.date === month)
        .reduce((sum, emission) => sum + emission.co2eTonnes, 0),
    );
    const slope = leastSquaresSlope(monthlySeries);
    // Extend the monthly trend linearly to the target year to project a
    // 12-month total at target date.
    const monthsAhead = Math.max(monthsBetween(window.end, `${target.targetYear}-12`), 0);
    const projectionTonnes = Math.max(currentTonnes + slope * 12 * monthsAhead, 0);
    const denominator = target.baselineTonnes - target.targetTonnes;
    const pctToTarget =
      denominator === 0 ? 0 : ((target.baselineTonnes - currentTonnes) / denominator) * 100;

    return {
      targetId: target.id,
      name: target.name,
      scope: target.scope,
      status: target.status,
      targetYear: target.targetYear,
      currentTonnes,
      targetTonnes: target.targetTonnes,
      pctToTarget: roundTo(pctToTarget, 1),
      onTrack: projectionTonnes <= target.targetTonnes,
      projectionTonnes,
    };
  });
}

export function computeHotspots(
  emissions: Emission[],
  activities: Activity[],
): HotspotItem[] {
  const window = resolveWindow(emissions);
  const activityById = new Map(activities.map((activity) => [activity.id, activity]));
  const firstHalf = window.months.slice(0, 6);
  const secondHalf = window.months.slice(6);

  type Acc = { tonnes: number; first: number; second: number };
  const grouped = new Map<ActivitySourceType, Acc>();

  for (const emission of emissions) {
    if (!window.months.includes(emission.date)) continue;
    const activity = activityById.get(emission.activityId);
    if (!activity) continue;
    const entry = grouped.get(activity.sourceType) ?? { tonnes: 0, first: 0, second: 0 };
    entry.tonnes += emission.co2eTonnes;
    if (firstHalf.includes(emission.date)) entry.first += emission.co2eTonnes;
    if (secondHalf.includes(emission.date)) entry.second += emission.co2eTonnes;
    grouped.set(activity.sourceType, entry);
  }

  const total = Array.from(grouped.values()).reduce((sum, entry) => sum + entry.tonnes, 0);

  return Array.from(grouped.entries())
    .map(([sourceType, entry]) => ({
      sourceType,
      label: sourceLabel(sourceType),
      tonnes: entry.tonnes,
      pctOfTotal: roundTo(safePct(entry.tonnes, total), 1),
      trendPct: roundTo(deltaPct(entry.second, entry.first), 1),
    }))
    .sort((a, b) => b.tonnes - a.tonnes);
}

export function computeReportSnapshot(
  emissions: Emission[],
  periodStart: string,
  periodEnd: string,
): ReportSnapshot {
  const months = monthRange(periodStart, periodEnd);
  const monthsSet = new Set(months);
  const inPeriod = emissions.filter((emission) => monthsSet.has(emission.date));
  const scope1Tonnes = inPeriod
    .filter((emission) => emission.scope === 1)
    .reduce((sum, emission) => sum + emission.co2eTonnes, 0);
  const scope2Tonnes = inPeriod
    .filter((emission) => emission.scope === 2)
    .reduce((sum, emission) => sum + emission.co2eTonnes, 0);
  const scope3Tonnes = inPeriod
    .filter((emission) => emission.scope === 3)
    .reduce((sum, emission) => sum + emission.co2eTonnes, 0);
  return {
    scope1Tonnes,
    scope2Tonnes,
    scope3Tonnes,
    totalTonnes: scope1Tonnes + scope2Tonnes + scope3Tonnes,
  };
}
