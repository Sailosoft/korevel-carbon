export type Scope = 1 | 2 | 3;

export type DataQuality = "primary" | "secondary" | "spend_based";

export type GwpSet = "AR4" | "AR5" | "AR6";

export type FactorSource = "DEFRA" | "EPA" | "IPCC" | "IEA" | "EXIOBASE";

export type ActivitySourceType =
  | "natural_gas"
  | "diesel"
  | "gasoline"
  | "electricity_grid"
  | "purchased_heat"
  | "company_vehicles"
  | "domestic_flights"
  | "international_flights"
  | "rail"
  | "waste"
  | "water"
  | "purchased_goods"
  | "capital_goods"
  | "upstream_transport"
  | "commuting"
  | "waste_treatment";

export type EmissionMethod = "factor_based" | "spend_based";

export type TargetScope = "1" | "2" | "3" | "1+2" | "1+2+3";

export type TargetStatus = "draft" | "committed" | "achieved" | "at_risk";

export type ProjectStatus = "proposed" | "in_progress" | "completed" | "cancelled";

export type ReportStatus = "draft" | "in_review" | "published";

export type AuditAction = "create" | "update" | "recalculate" | "approve" | "publish" | "export";

export type AuditEntityType =
  | "activity"
  | "emission"
  | "report"
  | "target"
  | "project"
  | "facility"
  | "factor"
  | "supplier";

export interface Facility {
  id: string;
  code: string;
  name: string;
  city: string;
  country: string;
  sector: string;
  floorAreaM2: number | null;
  headcount: number | null;
  isActive: boolean;
  openedAt: string;
}

export interface EmissionFactor {
  id: string;
  key: string;
  scope: Scope;
  category: string;
  activity: string;
  unit: string;
  co2ePerUnit: number;
  gwpSet: GwpSet;
  source: FactorSource;
  vintageYear: number;
  region: string | null;
}

export interface Activity {
  id: string;
  facilityId: string;
  date: string;
  scope: Scope;
  category: string;
  sourceType: ActivitySourceType;
  quantity: number;
  unit: string;
  supplierId: string | null;
  factorId: string;
  dataQuality: DataQuality;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Emission {
  id: string;
  activityId: string;
  facilityId: string;
  date: string;
  scope: Scope;
  co2eKg: number;
  co2eTonnes: number;
  method: EmissionMethod;
  calculatedAt: string;
}

export interface Supplier {
  id: string;
  name: string;
  category: string;
  country: string;
  annualSpend: number;
  dataQuality: DataQuality;
  rating: number;
  isActive: boolean;
}

export interface Target {
  id: string;
  name: string;
  scope: TargetScope;
  baseYear: number;
  baselineTonnes: number;
  targetYear: number;
  targetTonnes: number;
  status: TargetStatus;
  owner: string;
}

export interface Project {
  id: string;
  name: string;
  targetId: string | null;
  facilityId: string | null;
  owner: string;
  status: ProjectStatus;
  startAt: string;
  endAt: string | null;
  capex: number;
  expectedReductionTonnes: number;
  actualReductionTonnes: number;
  progressPct: number;
}

export interface Report {
  id: string;
  title: string;
  periodStart: string;
  periodEnd: string;
  status: ReportStatus;
  scope1Tonnes: number;
  scope2Tonnes: number;
  scope3Tonnes: number;
  totalTonnes: number;
  generatedAt: string;
  publishedAt: string | null;
}

export interface AuditLogEntry {
  seq?: number;
  at: string;
  actor: string;
  action: AuditAction;
  entityType: AuditEntityType;
  entityId: string;
  summary: string;
}
