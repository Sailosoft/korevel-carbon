import { calendarMonths, SEED_MONTHS } from "../lib/months";
import { factorKeyFor, SOURCE_TYPE_META } from "./sourceTypes";
import type {
  Activity,
  ActivitySourceType,
  AuditLogEntry,
  DataQuality,
  EmissionFactor,
  Facility,
  Project,
  Report,
  Supplier,
  Target,
} from "./types";

export const SEED_GENERATED_AT = "2026-10-01T06:00:00.000Z";

export type ReportSeed = Omit<
  Report,
  "scope1Tonnes" | "scope2Tonnes" | "scope3Tonnes" | "totalTonnes"
>;

export type SeedBundle = {
  facilities: Facility[];
  emissionFactors: EmissionFactor[];
  suppliers: Supplier[];
  targets: Target[];
  projects: Project[];
  activities: Activity[];
  reports: ReportSeed[];
  auditLog: AuditLogEntry[];
};

/** Fixed-seed PRNG (mulberry32) so charts and tests stay stable. */
function mulberry32(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

type Rng = () => number;

function jitter(rng: Rng, value: number, pct = 0.08): number {
  return value * (1 + (rng() * 2 - 1) * pct);
}

// Seasonal profiles (Jan..Dec) normalised to their mean by seasonalFactor().
const CLIMATE_ELECTRICITY = [1.14, 1.11, 1.05, 0.97, 0.92, 0.9, 0.93, 0.93, 0.98, 1.04, 1.09, 1.15];
const DATACENTER_ELECTRICITY = [0.97, 0.97, 0.99, 1.0, 1.03, 1.05, 1.06, 1.06, 1.03, 1.0, 0.99, 0.97];
const HEATING_GAS = [2.0, 1.8, 1.4, 0.85, 0.4, 0.18, 0.12, 0.14, 0.4, 0.85, 1.4, 1.9];

function seasonalFactor(month: string, profile: number[]): number {
  const mean = profile.reduce((sum, value) => sum + value, 0) / profile.length;
  return profile[calendarMonths(month)] / mean;
}

function pickQuality(rng: Rng): DataQuality {
  // Spend-based values come from the dedicated purchased-goods series.
  return rng() < 0.55 ? "primary" : "secondary";
}

export const SEED_FACILITIES: Facility[] = [
  {
    id: "fac-nl-01",
    code: "FAC-NL-01",
    name: "Rotterdam Plant",
    city: "Rotterdam",
    country: "NL",
    sector: "Manufacturing",
    floorAreaM2: 18500,
    headcount: 420,
    isActive: true,
    openedAt: "2012-03-01",
  },
  {
    id: "fac-de-02",
    code: "FAC-DE-02",
    name: "Berlin Office",
    city: "Berlin",
    country: "DE",
    sector: "Services",
    floorAreaM2: 3200,
    headcount: 180,
    isActive: true,
    openedAt: "2016-09-01",
  },
  {
    id: "fac-us-03",
    code: "FAC-US-03",
    name: "Austin Warehouse",
    city: "Austin",
    country: "US",
    sector: "Logistics",
    floorAreaM2: 12000,
    headcount: 95,
    isActive: true,
    openedAt: "2019-05-15",
  },
  {
    id: "fac-es-04",
    code: "FAC-ES-04",
    name: "Madrid Data Center",
    city: "Madrid",
    country: "ES",
    sector: "ICT",
    floorAreaM2: 900,
    headcount: 40,
    isActive: true,
    openedAt: "2021-11-01",
  },
];

const factor = (
  key: string,
  scope: 1 | 2 | 3,
  category: string,
  activity: string,
  unit: string,
  co2ePerUnit: number,
  gwpSet: EmissionFactor["gwpSet"],
  source: EmissionFactor["source"],
  vintageYear: number,
  region: string | null = null,
): EmissionFactor => ({
  id: `ef-${key}`,
  key,
  scope,
  category,
  activity,
  unit,
  co2ePerUnit,
  gwpSet,
  source,
  vintageYear,
  region,
});

export const SEED_EMISSION_FACTORS: EmissionFactor[] = [
  // Scope 1
  factor("natural-gas-combustion", 1, "fuel-combustion", "Natural gas (stationary)", "m3", 2.04, "AR5", "DEFRA", 2024),
  factor("diesel-stationary", 1, "fuel-combustion", "Diesel (stationary)", "litre", 2.66, "AR5", "DEFRA", 2024),
  factor("gasoline-fleet", 1, "mobile-combustion", "Gasoline (fleet)", "litre", 2.16, "AR5", "DEFRA", 2024),
  factor("refrigerant-leak-r410a", 1, "refrigerant-leaks", "R-410A (refrigerant leak)", "kg", 1924, "AR5", "IPCC", 2024),
  // Scope 2
  factor("grid-electricity-nl", 2, "purchased-electricity", "Grid electricity (NL)", "kWh", 0.272, "AR6", "IEA", 2024, "NL"),
  factor("grid-electricity-de", 2, "purchased-electricity", "Grid electricity (DE)", "kWh", 0.366, "AR6", "IEA", 2024, "DE"),
  factor("grid-electricity-us", 2, "purchased-electricity", "Grid electricity (US)", "kWh", 0.369, "AR6", "EPA", 2024, "US"),
  factor("grid-electricity-es", 2, "purchased-electricity", "Grid electricity (ES)", "kWh", 0.194, "AR6", "IEA", 2024, "ES"),
  factor("district-heat", 2, "purchased-heat", "Purchased heat (district)", "kWh", 0.18, "AR6", "IEA", 2024),
  // Scope 3
  factor("flight-domestic", 3, "business-travel", "Domestic flight", "passenger-km", 0.246, "AR5", "DEFRA", 2024),
  factor("flight-international", 3, "business-travel", "International flight", "passenger-km", 0.156, "AR5", "DEFRA", 2024),
  factor("rail-passenger", 3, "business-travel", "Rail (passenger)", "passenger-km", 0.041, "AR5", "DEFRA", 2024),
  factor("waste-landfill", 3, "waste-treatment", "Municipal waste (landfill)", "tonne", 580, "AR5", "DEFRA", 2024),
  factor("purchased-goods-spend", 3, "purchased-goods", "Purchased goods (spend-based)", "EUR", 0.42, "AR6", "DEFRA", 2024),
  factor("freight-road", 3, "upstream-transport", "Road freight (upstream)", "tonne-km", 0.12, "AR5", "DEFRA", 2024),
  factor("commuting-car", 3, "commuting", "Commuting (car)", "passenger-km", 0.17, "AR5", "DEFRA", 2024),
];

export const SEED_SUPPLIERS: Supplier[] = [
  { id: "sup-01", name: "NordSteel AB", category: "Raw materials", country: "SE", annualSpend: 5200000, dataQuality: "secondary", rating: 4, isActive: true },
  { id: "sup-02", name: "PolyPack GmbH", category: "Packaging", country: "DE", annualSpend: 1850000, dataQuality: "spend_based", rating: 2, isActive: true },
  { id: "sup-03", name: "Global Freight Co", category: "Logistics", country: "NL", annualSpend: 2400000, dataQuality: "primary", rating: 5, isActive: true },
  { id: "sup-04", name: "ChemPure NV", category: "Raw materials", country: "BE", annualSpend: 3100000, dataQuality: "secondary", rating: 3, isActive: true },
  { id: "sup-05", name: "GreenBox Packaging", category: "Packaging", country: "NL", annualSpend: 1250000, dataQuality: "spend_based", rating: 4, isActive: true },
  { id: "sup-06", name: "Iberia Components SL", category: "Components", country: "ES", annualSpend: 2050000, dataQuality: "secondary", rating: 3, isActive: true },
  { id: "sup-07", name: "TransAtlantic Shipping", category: "Logistics", country: "US", annualSpend: 1150000, dataQuality: "primary", rating: 4, isActive: true },
  { id: "sup-08", name: "OfficeWorks AG", category: "Office supplies", country: "DE", annualSpend: 820000, dataQuality: "spend_based", rating: 2, isActive: false },
];

export const SEED_TARGETS: Target[] = [
  { id: "tgt-01", name: "SBTi 1.5C scope 1+2", scope: "1+2", baseYear: 2022, baselineTonnes: 4820, targetYear: 2030, targetTonnes: 2796, status: "committed", owner: "Head of Sustainability" },
  { id: "tgt-02", name: "Fleet electrification", scope: "1", baseYear: 2024, baselineTonnes: 640, targetYear: 2028, targetTonnes: 192, status: "committed", owner: "Fleet Manager" },
  { id: "tgt-03", name: "Supplier engagement program", scope: "3", baseYear: 2023, baselineTonnes: 9100, targetYear: 2030, targetTonnes: 7280, status: "draft", owner: "Procurement Lead" },
];

export const SEED_PROJECTS: Project[] = [
  { id: "prj-01", name: "Rooftop solar Phase 1", targetId: "tgt-01", facilityId: "fac-nl-01", owner: "Ingrid de Vries", status: "in_progress", startAt: "2025-06-01", endAt: null, capex: 1200000, expectedReductionTonnes: 410, actualReductionTonnes: 180, progressPct: 60 },
  { id: "prj-02", name: "Heat pump retrofit", targetId: "tgt-01", facilityId: "fac-de-02", owner: "Lukas Weber", status: "completed", startAt: "2025-01-15", endAt: "2026-05-30", capex: 380000, expectedReductionTonnes: 160, actualReductionTonnes: 145, progressPct: 100 },
  { id: "prj-03", name: "EV fleet swap", targetId: "tgt-02", facilityId: "fac-us-03", owner: "Dana Mitchell", status: "in_progress", startAt: "2025-09-01", endAt: "2026-12-31", capex: 640000, expectedReductionTonnes: 220, actualReductionTonnes: 60, progressPct: 35 },
  { id: "prj-04", name: "LED relighting program", targetId: "tgt-01", facilityId: "fac-es-04", owner: "Carmen Ruiz", status: "in_progress", startAt: "2026-01-10", endAt: "2026-11-30", capex: 120000, expectedReductionTonnes: 75, actualReductionTonnes: 30, progressPct: 45 },
  { id: "prj-05", name: "Supplier data onboarding", targetId: "tgt-03", facilityId: null, owner: "Pieter Smit", status: "proposed", startAt: "2026-03-01", endAt: null, capex: 90000, expectedReductionTonnes: 300, actualReductionTonnes: 0, progressPct: 10 },
  { id: "prj-06", name: "Waste sorting upgrade", targetId: "tgt-01", facilityId: "fac-nl-01", owner: "Ingrid de Vries", status: "cancelled", startAt: "2025-08-01", endAt: "2026-02-01", capex: 45000, expectedReductionTonnes: 60, actualReductionTonnes: 12, progressPct: 20 },
];

export const SEED_REPORTS: ReportSeed[] = [
  { id: "rep-fy2025", title: "FY2025 Annual Inventory", periodStart: "2025-01", periodEnd: "2025-12", status: "published", generatedAt: "2026-07-15T08:45:00.000Z", publishedAt: "2026-07-15T09:00:00.000Z" },
  { id: "rep-q2-2026", title: "Q2 2026 Internal Review", periodStart: "2026-04", periodEnd: "2026-06", status: "in_review", generatedAt: "2026-07-16T11:10:00.000Z", publishedAt: null },
  { id: "rep-q3-2026", title: "Q3 2026 Working Draft", periodStart: "2026-07", periodEnd: "2026-09", status: "draft", generatedAt: "2026-09-28T15:00:00.000Z", publishedAt: null },
];

export const SEED_AUDIT_LOG: AuditLogEntry[] = [
  { at: "2025-10-02T09:12:00.000Z", actor: "seed@korevel.io", action: "create", entityType: "facility", entityId: "fac-nl-01", summary: "Seeded facility \"Rotterdam Plant\" (FAC-NL-01)" },
  { at: "2025-10-02T09:13:00.000Z", actor: "seed@korevel.io", action: "create", entityType: "facility", entityId: "fac-de-02", summary: "Seeded facility \"Berlin Office\" (FAC-DE-02)" },
  { at: "2025-10-02T09:14:00.000Z", actor: "seed@korevel.io", action: "create", entityType: "facility", entityId: "fac-us-03", summary: "Seeded facility \"Austin Warehouse\" (FAC-US-03)" },
  { at: "2025-10-02T09:15:00.000Z", actor: "seed@korevel.io", action: "create", entityType: "facility", entityId: "fac-es-04", summary: "Seeded facility \"Madrid Data Center\" (FAC-ES-04)" },
  { at: "2025-10-02T09:30:00.000Z", actor: "seed@korevel.io", action: "create", entityType: "factor", entityId: "batch", summary: "Loaded emission factor library (16 factors: DEFRA, EPA, IPCC, IEA)" },
  { at: "2025-11-05T10:00:00.000Z", actor: "jdoe@korevel.io", action: "recalculate", entityType: "emission", entityId: "batch", summary: "Recalculated 48 emissions for 2025-10" },
  { at: "2025-12-04T10:05:00.000Z", actor: "jdoe@korevel.io", action: "recalculate", entityType: "emission", entityId: "batch", summary: "Recalculated 52 emissions for 2025-11" },
  { at: "2026-01-08T11:20:00.000Z", actor: "jdoe@korevel.io", action: "create", entityType: "activity", entityId: "batch", summary: "Imported activity data for 2025-Q4" },
  { at: "2026-02-03T09:40:00.000Z", actor: "psmit@korevel.io", action: "create", entityType: "supplier", entityId: "sup-01", summary: "Created supplier \"NordSteel AB\"" },
  { at: "2026-03-12T14:00:00.000Z", actor: "head.sustainability@korevel.io", action: "approve", entityType: "target", entityId: "tgt-01", summary: "Approved target \"SBTi 1.5C scope 1+2\"" },
  { at: "2026-03-12T14:05:00.000Z", actor: "fleet@korevel.io", action: "approve", entityType: "target", entityId: "tgt-02", summary: "Approved target \"Fleet electrification\"" },
  { at: "2026-04-10T10:15:00.000Z", actor: "jdoe@korevel.io", action: "create", entityType: "project", entityId: "prj-01", summary: "Created project \"Rooftop solar Phase 1\"" },
  { at: "2026-05-20T16:30:00.000Z", actor: "jdoe@korevel.io", action: "update", entityType: "project", entityId: "prj-06", summary: "Cancelled project \"Waste sorting upgrade\"" },
  { at: "2026-06-30T17:00:00.000Z", actor: "jdoe@korevel.io", action: "recalculate", entityType: "emission", entityId: "batch", summary: "Recalculated 196 emissions for H1 review" },
  { at: "2026-07-15T08:45:00.000Z", actor: "jdoe@korevel.io", action: "create", entityType: "report", entityId: "rep-fy2025", summary: "Generated report \"FY2025 Annual Inventory\"" },
  { at: "2026-07-15T09:00:00.000Z", actor: "head.sustainability@korevel.io", action: "publish", entityType: "report", entityId: "rep-fy2025", summary: "Report \"FY2025 Annual Inventory\" published" },
  { at: "2026-07-16T11:10:00.000Z", actor: "jdoe@korevel.io", action: "create", entityType: "report", entityId: "rep-q2-2026", summary: "Generated report \"Q2 2026 Internal Review\"" },
  { at: "2026-07-16T13:25:00.000Z", actor: "head.sustainability@korevel.io", action: "approve", entityType: "report", entityId: "rep-q2-2026", summary: "Report \"Q2 2026 Internal Review\" sent for review" },
  { at: "2026-09-28T15:00:00.000Z", actor: "jdoe@korevel.io", action: "create", entityType: "report", entityId: "rep-q3-2026", summary: "Generated report \"Q3 2026 Working Draft\"" },
  { at: "2026-09-30T18:00:00.000Z", actor: "jdoe@korevel.io", action: "export", entityType: "activity", entityId: "all", summary: "Exported emissions workbook (mock export)" },
];

type MonthlySeries = {
  sourceType: ActivitySourceType;
  facilityId: string;
  /** Mean monthly quantity before seasonality, growth and jitter. */
  base: number;
  quality: DataQuality | "mixed";
  profile?: number[];
  /** Multiplicative growth applied per month index (e.g. 0.006 = +0.6%/mo). */
  growthPerMonth?: number;
  /** Efficiency factor applied to months in 2026 (e.g. 0.97 = -3% YoY). */
  efficiency2026?: number;
  supplierIds?: string[];
  notes?: string;
};

const MONTHLY_SERIES: MonthlySeries[] = [
  { sourceType: "electricity_grid", facilityId: "fac-nl-01", base: 260000, quality: "primary", profile: CLIMATE_ELECTRICITY, efficiency2026: 0.97, notes: "Smart meter readings" },
  { sourceType: "electricity_grid", facilityId: "fac-de-02", base: 32000, quality: "primary", profile: CLIMATE_ELECTRICITY, efficiency2026: 0.97 },
  { sourceType: "electricity_grid", facilityId: "fac-us-03", base: 147000, quality: "primary", profile: CLIMATE_ELECTRICITY, efficiency2026: 0.97 },
  { sourceType: "electricity_grid", facilityId: "fac-es-04", base: 627000, quality: "primary", profile: DATACENTER_ELECTRICITY, efficiency2026: 0.97, notes: "Data hall + cooling load" },
  { sourceType: "natural_gas", facilityId: "fac-nl-01", base: 7000, quality: "mixed", profile: HEATING_GAS, efficiency2026: 0.97 },
  { sourceType: "natural_gas", facilityId: "fac-de-02", base: 2000, quality: "mixed", profile: HEATING_GAS, efficiency2026: 0.97 },
  { sourceType: "natural_gas", facilityId: "fac-us-03", base: 1200, quality: "mixed", profile: HEATING_GAS },
  { sourceType: "company_vehicles", facilityId: "fac-nl-01", base: 2000, quality: "mixed", growthPerMonth: 0.006 },
  { sourceType: "company_vehicles", facilityId: "fac-us-03", base: 1500, quality: "mixed", growthPerMonth: 0.006 },
  { sourceType: "diesel", facilityId: "fac-nl-01", base: 1565, quality: "secondary", growthPerMonth: 0.002 },
  {
    sourceType: "purchased_goods",
    facilityId: "fac-nl-01",
    base: 1100000,
    quality: "spend_based",
    growthPerMonth: 0.004,
    supplierIds: ["sup-01", "sup-04", "sup-06"],
    notes: "Monthly supplier spend (ERP export)",
  },
  {
    sourceType: "purchased_goods",
    facilityId: "fac-de-02",
    base: 385000,
    quality: "spend_based",
    growthPerMonth: 0.004,
    supplierIds: ["sup-02", "sup-05", "sup-08"],
    notes: "Monthly supplier spend (ERP export)",
  },
  { sourceType: "waste", facilityId: "fac-nl-01", base: 40, quality: "secondary" },
  { sourceType: "commuting", facilityId: "fac-de-02", base: 60000, quality: "mixed", notes: "Commuter survey (annualised)" },
  {
    sourceType: "upstream_transport",
    facilityId: "fac-nl-01",
    base: 50000,
    quality: "primary",
    growthPerMonth: 0.005,
    supplierIds: ["sup-03"],
    notes: "Inbound freight from carrier telematics",
  },
];

const QUARTER_STARTS = ["2025-10", "2026-01", "2026-04", "2026-07"];
const DOMESTIC_FLIGHT_FACILITIES = ["fac-de-02", "fac-es-04", "fac-us-03", "fac-nl-01"];
const INTERNATIONAL_FLIGHT_FACILITIES = [
  "fac-nl-01",
  "fac-us-03",
  "fac-nl-01",
  "fac-us-03",
  "fac-nl-01",
  "fac-us-03",
  "fac-nl-01",
  "fac-us-03",
];
const RAIL_FACILITIES = ["fac-de-02", "fac-nl-01", "fac-de-02", "fac-nl-01"];

function buildActivity(
  counter: { value: number },
  sourceType: ActivitySourceType,
  facilityId: string,
  date: string,
  quantity: number,
  dataQuality: DataQuality,
  supplierId: string | null = null,
  notes: string | null = null,
): Activity {
  const meta = SOURCE_TYPE_META[sourceType];
  const facility = SEED_FACILITIES.find((item) => item.id === facilityId);
  const factorKey = factorKeyFor(sourceType, facility?.country);
  counter.value += 1;
  return {
    id: `act-${String(counter.value).padStart(4, "0")}`,
    facilityId,
    date,
    scope: meta.scope,
    category: meta.category,
    sourceType,
    quantity,
    unit: meta.unit,
    supplierId: meta.supportsSupplier ? supplierId : null,
    factorId: factorKey ? `ef-${factorKey}` : "",
    dataQuality,
    notes,
    createdAt: `${date}-25T08:00:00.000Z`,
    updatedAt: `${date}-25T08:00:00.000Z`,
  };
}

function roundQuantity(sourceType: ActivitySourceType, value: number): number {
  if (sourceType === "purchased_goods") return Math.round(value / 100) * 100;
  return Math.round(value);
}

export function buildSeedData(): SeedBundle {
  const rng = mulberry32(20261001);
  const activities: Activity[] = [];
  const counter = { value: 0 };

  for (const series of MONTHLY_SERIES) {
    SEED_MONTHS.forEach((month, index) => {
      const seasonal = series.profile ? seasonalFactor(month, series.profile) : 1;
      const growth = series.growthPerMonth ? 1 + series.growthPerMonth * index : 1;
      const efficiency = series.efficiency2026 && month.startsWith("2026") ? series.efficiency2026 : 1;
      const quantity = roundQuantity(
        series.sourceType,
        jitter(rng, series.base * seasonal * growth * efficiency),
      );
      const dataQuality =
        series.quality === "mixed" ? pickQuality(rng) : series.quality;
      const supplierId = series.supplierIds
        ? series.supplierIds[index % series.supplierIds.length]
        : null;
      activities.push(
        buildActivity(
          counter,
          series.sourceType,
          series.facilityId,
          month,
          Math.max(quantity, 1),
          dataQuality,
          supplierId,
          series.notes ?? null,
        ),
      );
    });
  }

  // Quarterly business travel: 4 domestic, 8 international and 4 rail trips.
  QUARTER_STARTS.forEach((quarterStart, index) => {
    activities.push(
      buildActivity(
        counter,
        "domestic_flights",
        DOMESTIC_FLIGHT_FACILITIES[index],
        quarterStart,
        Math.round(jitter(rng, 1800, 0.25)),
        "primary",
      ),
    );
    for (const facilityId of [
      INTERNATIONAL_FLIGHT_FACILITIES[index * 2],
      INTERNATIONAL_FLIGHT_FACILITIES[index * 2 + 1],
    ]) {
      activities.push(
        buildActivity(
          counter,
          "international_flights",
          facilityId,
          quarterStart,
          Math.round(jitter(rng, 12000, 0.3)),
          "primary",
        ),
      );
    }
    activities.push(
      buildActivity(
        counter,
        "rail",
        RAIL_FACILITIES[index],
        quarterStart,
        Math.round(jitter(rng, 6000, 0.2)),
        "secondary",
      ),
    );
  });

  return {
    facilities: SEED_FACILITIES,
    emissionFactors: SEED_EMISSION_FACTORS,
    suppliers: SEED_SUPPLIERS,
    targets: SEED_TARGETS,
    projects: SEED_PROJECTS,
    activities,
    reports: SEED_REPORTS,
    auditLog: SEED_AUDIT_LOG,
  };
}
