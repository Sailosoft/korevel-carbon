import { create } from "zustand";
import type { Scope } from "../db/types";

export type PortalState = {
  facilityId: string | null;
  scope: Scope | null;
  period: string | null;
  activeTab: string;
  setFacilityId: (facilityId: string | null) => void;
  setScope: (scope: Scope | null) => void;
  setPeriod: (period: string | null) => void;
  setActiveTab: (tab: string) => void;
  resetFilters: () => void;
};

export const usePortalStore = create<PortalState>((set) => ({
  facilityId: null,
  scope: null,
  period: null,
  activeTab: "facilities",
  setFacilityId: (facilityId) => set({ facilityId }),
  setScope: (scope) => set({ scope }),
  setPeriod: (period) => set({ period }),
  setActiveTab: (activeTab) => set({ activeTab }),
  resetFilters: () => set({ facilityId: null, scope: null, period: null }),
}));
