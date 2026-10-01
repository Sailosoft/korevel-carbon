/** Dexie store names, exported for typo safety across services and hooks. */
export const STORE = {
  facilities: "facilities",
  emissionFactors: "emissionFactors",
  activities: "activities",
  emissions: "emissions",
  suppliers: "suppliers",
  targets: "targets",
  projects: "projects",
  reports: "reports",
  auditLog: "auditLog",
} as const;

export type StoreName = (typeof STORE)[keyof typeof STORE];
