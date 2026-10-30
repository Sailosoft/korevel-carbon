import { STORE } from "./indexes";

export const SCHEMA_VERSION = 2;

/** Version 1 shipped before departments existed and stored a free-text department. */
export const LEGACY_SCHEMA_V1: Record<string, string> = {
  [STORE.users]: "id, &email, role, status, [role+status], createdAt",
};

export const SCHEMA: Record<keyof typeof STORE, string> = {
  [STORE.users]: "id, &email, role, status, departmentId, [role+status], createdAt",
  [STORE.departments]: "id, &name, &code, createdAt",
};
