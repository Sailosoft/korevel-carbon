import { useCallback, useMemo, useState } from "react";
import { APP_REGISTRY, type AppDescriptor } from "@/modules/registry";
import {
  countByStatus,
  filterApps,
  type CatalogCounts,
  type StatusFilter,
} from "../catalogFilters";

type CatalogFilterState = {
  query: string;
  status: StatusFilter;
  results: AppDescriptor[];
  counts: CatalogCounts;
  isFiltering: boolean;
  setQuery: (query: string) => void;
  setStatus: (status: StatusFilter) => void;
  clear: () => void;
};

export function useCatalogFilter(
  apps: AppDescriptor[] = APP_REGISTRY,
): CatalogFilterState {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<StatusFilter>("all");

  const results = useMemo(
    () => filterApps(apps, { query, status }),
    [apps, query, status],
  );
  const counts = useMemo(() => countByStatus(apps), [apps]);

  const clear = useCallback(() => {
    setQuery("");
    setStatus("all");
  }, []);

  return {
    query,
    status,
    results,
    counts,
    isFiltering: query.trim() !== "" || status !== "all",
    setQuery,
    setStatus,
    clear,
  };
}
