import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export type SnackbarSeverity = "success" | "info" | "warning" | "error";

type SnackbarMessage = {
  message: string;
  severity: SnackbarSeverity;
};

type UiState = {
  snackbar: SnackbarMessage | null;
  sidebarCollapsed: boolean;
  notify: (message: string, severity?: SnackbarSeverity) => void;
  dismiss: () => void;
  toggleSidebarCollapsed: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
};

export const useUiStore = create<UiState>()(
  persist(
    (set) => ({
      snackbar: null,
      sidebarCollapsed: false,
      notify: (message, severity = "success") => set({ snackbar: { message, severity } }),
      dismiss: () => set({ snackbar: null }),
      toggleSidebarCollapsed: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
      setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
    }),
    {
      name: "glassglow-erp-ui",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ sidebarCollapsed: state.sidebarCollapsed }),
      skipHydration: true,
    },
  ),
);
