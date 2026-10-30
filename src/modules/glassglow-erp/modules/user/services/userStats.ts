import type { Department, User } from "../../../db/types";
import type { UserFilters } from "../types";

export type UserStats = {
  total: number;
  active: number;
  invited: number;
  suspended: number;
};

export function computeUserStats(users: User[]): UserStats {
  const stats: UserStats = {
    total: users.length,
    active: 0,
    invited: 0,
    suspended: 0,
  };

  for (const user of users) {
    stats[user.status] += 1;
  }

  return stats;
}

export function sortUsersNewestFirst(users: User[]): User[] {
  return [...users].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function recentUsers(users: User[], limit = 5): User[] {
  return sortUsersNewestFirst(users).slice(0, limit);
}

export function filterUsers(
  users: User[],
  filters: UserFilters,
  departmentsById: Map<string, Department>,
): User[] {
  const needle = filters.search.trim().toLowerCase();

  return users.filter((user) => {
    if (filters.role !== null && user.role !== filters.role) return false;
    if (filters.status !== null && user.status !== filters.status) return false;
    if (filters.departmentId !== null && user.departmentId !== filters.departmentId) return false;
    if (needle === "") return true;

    const department = departmentsById.get(user.departmentId);
    return [
      user.name,
      user.email,
      department?.name ?? "",
      department?.code ?? "",
    ].some((value) => value.toLowerCase().includes(needle));
  });
}
