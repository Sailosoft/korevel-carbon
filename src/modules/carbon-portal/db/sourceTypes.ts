import type { ActivitySourceType, Scope } from "./types";

export type SourceTypeMeta = {
  sourceType: ActivitySourceType;
  label: string;
  scope: Scope;
  category: string;
  unit: string;
  /** Canonical factor key; null when the key is derived from the facility region. */
  factorKey: string | null;
  /** True when one factor exists per facility region (grid electricity). */
  regional: boolean;
  /** True when activities of this source can be attributed to a supplier. */
  supportsSupplier: boolean;
};

const meta = (
  sourceType: ActivitySourceType,
  label: string,
  scope: Scope,
  category: string,
  unit: string,
  factorKey: string | null,
  options?: Partial<Pick<SourceTypeMeta, "regional" | "supportsSupplier">>,
): SourceTypeMeta => ({
  sourceType,
  label,
  scope,
  category,
  unit,
  factorKey,
  regional: options?.regional ?? false,
  supportsSupplier: options?.supportsSupplier ?? false,
});

export const SOURCE_TYPE_META: Record<ActivitySourceType, SourceTypeMeta> = {
  natural_gas: meta("natural_gas", "Natural gas", 1, "fuel-combustion", "m3", "natural-gas-combustion"),
  diesel: meta("diesel", "Diesel (stationary)", 1, "fuel-combustion", "litre", "diesel-stationary"),
  gasoline: meta("gasoline", "Gasoline", 1, "mobile-combustion", "litre", "gasoline-fleet"),
  electricity_grid: meta("electricity_grid", "Grid electricity", 2, "purchased-electricity", "kWh", null, {
    regional: true,
  }),
  purchased_heat: meta("purchased_heat", "Purchased heat", 2, "purchased-heat", "kWh", "district-heat"),
  company_vehicles: meta("company_vehicles", "Company vehicles", 1, "mobile-combustion", "litre", "gasoline-fleet"),
  domestic_flights: meta("domestic_flights", "Domestic flights", 3, "business-travel", "passenger-km", "flight-domestic"),
  international_flights: meta(
    "international_flights",
    "International flights",
    3,
    "business-travel",
    "passenger-km",
    "flight-international",
  ),
  rail: meta("rail", "Rail travel", 3, "business-travel", "passenger-km", "rail-passenger"),
  waste: meta("waste", "Waste (landfill)", 3, "waste-treatment", "tonne", "waste-landfill"),
  waste_treatment: meta("waste_treatment", "Waste treatment", 3, "waste-treatment", "tonne", "waste-landfill"),
  water: meta("water", "Water supply", 3, "water-supply", "m3", null),
  purchased_goods: meta("purchased_goods", "Purchased goods", 3, "purchased-goods", "EUR", "purchased-goods-spend", {
    supportsSupplier: true,
  }),
  capital_goods: meta("capital_goods", "Capital goods", 3, "purchased-goods", "EUR", "purchased-goods-spend", {
    supportsSupplier: true,
  }),
  upstream_transport: meta(
    "upstream_transport",
    "Upstream transport",
    3,
    "upstream-transport",
    "tonne-km",
    "freight-road",
    { supportsSupplier: true },
  ),
  commuting: meta("commuting", "Employee commuting", 3, "commuting", "passenger-km", "commuting-car"),
};

export const ACTIVITY_SOURCE_TYPES = Object.keys(SOURCE_TYPE_META) as ActivitySourceType[];

export function sourceLabel(sourceType: ActivitySourceType): string {
  return SOURCE_TYPE_META[sourceType].label;
}

/** Emission matching key for an activity, resolving region-specific factors. */
export function factorKeyFor(
  sourceType: ActivitySourceType,
  facilityCountry?: string,
): string | null {
  const metaForSource = SOURCE_TYPE_META[sourceType];
  if (metaForSource.regional) {
    if (!facilityCountry) return null;
    return `grid-electricity-${facilityCountry.toLowerCase()}`;
  }
  return metaForSource.factorKey;
}
