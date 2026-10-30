import type { UserRole, UserStatus } from "../../db/types";

export type UserInput = {
  id?: string;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  departmentId: string;
};

export type UserFilters = {
  search: string;
  role: UserRole | null;
  status: UserStatus | null;
  departmentId: string | null;
};

export const USER_ROLE_LABEL: Record<UserRole, string> = {
  admin: "Admin",
  manager: "Manager",
  staff: "Staff",
  viewer: "Viewer",
};

export const USER_STATUS_LABEL: Record<UserStatus, string> = {
  active: "Active",
  invited: "Invited",
  suspended: "Suspended",
};

export const USER_ROLES: readonly UserRole[] = ["admin", "manager", "staff", "viewer"];

export const USER_STATUSES: readonly UserStatus[] = ["active", "invited", "suspended"];

export const USER_ROLE_OPTIONS = USER_ROLES.map((role) => ({
  value: role,
  label: USER_ROLE_LABEL[role],
}));

export const USER_STATUS_OPTIONS = USER_STATUSES.map((status) => ({
  value: status,
  label: USER_STATUS_LABEL[status],
}));
