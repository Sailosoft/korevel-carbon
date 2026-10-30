import { create } from "zustand";
import type { UserRole, UserStatus } from "../../../db/types";

type UserTableState = {
  search: string;
  role: UserRole | null;
  status: UserStatus | null;
  departmentId: string | null;
  setSearch: (search: string) => void;
  setRole: (role: UserRole | null) => void;
  setStatus: (status: UserStatus | null) => void;
  setDepartmentId: (departmentId: string | null) => void;
  resetFilters: () => void;
};

export const useUserTableStore = create<UserTableState>((set) => ({
  search: "",
  role: null,
  status: null,
  departmentId: null,
  setSearch: (search) => set({ search }),
  setRole: (role) => set({ role }),
  setStatus: (status) => set({ status }),
  setDepartmentId: (departmentId) => set({ departmentId }),
  resetFilters: () => set({ search: "", role: null, status: null, departmentId: null }),
}));
