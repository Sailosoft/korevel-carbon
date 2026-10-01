import type { AppDescriptor, AppStatus } from "@/modules/registry";

export type StatusFilter = "all" | AppStatus;

export type CatalogQuery = {
  query: string;
  status: StatusFilter;
};

export type CatalogCounts = {
  total: number;
  available: number;
  comingSoon: number;
};

function matchesQuery(app: AppDescriptor, rawQuery: string): boolean {
  const query = rawQuery.trim().toLowerCase();
  if (!query) {
    return true;
  }
  return [app.name, app.description, app.id].some((field) =>
    field.toLowerCase().includes(query),
  );
}

export function filterApps(
  apps: AppDescriptor[],
  { query, status }: CatalogQuery,
): AppDescriptor[] {
  return apps.filter(
    (app) =>
      (status === "all" || app.status === status) && matchesQuery(app, query),
  );
}

export function countByStatus(apps: AppDescriptor[]): CatalogCounts {
  return apps.reduce<CatalogCounts>(
    (counts, app) => {
      counts.total += 1;
      if (app.status === "available") {
        counts.available += 1;
      } else {
        counts.comingSoon += 1;
      }
      return counts;
    },
    { total: 0, available: 0, comingSoon: 0 },
  );
}
