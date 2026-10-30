/** Dexie store names, exported for typo safety across services and hooks. */
export const STORE = {
  users: "users",
  departments: "departments",
} as const;

export type StoreName = (typeof STORE)[keyof typeof STORE];
