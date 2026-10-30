import { create } from "zustand";

type DepartmentTableState = {
  search: string;
  setSearch: (search: string) => void;
  resetFilters: () => void;
};

export const useDepartmentTableStore = create<DepartmentTableState>((set) => ({
  search: "",
  setSearch: (search) => set({ search }),
  resetFilters: () => set({ search: "" }),
}));
