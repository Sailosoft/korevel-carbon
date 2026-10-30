import { useLiveQuery } from "dexie-react-hooks";
import { glassglowDb } from "../../../db/database";
import type { User } from "../../../db/types";
import {
  computeUserStats,
  recentUsers,
  sortUsersNewestFirst,
  type UserStats,
} from "../services/userStats";

export function useUsers(): User[] | undefined {
  return useLiveQuery(async () => sortUsersNewestFirst(await glassglowDb.users.toArray()), []);
}

export function useUserStats(): UserStats | undefined {
  return useLiveQuery(async () => computeUserStats(await glassglowDb.users.toArray()), []);
}

export function useRecentUsers(limit = 5): User[] | undefined {
  return useLiveQuery(async () => recentUsers(await glassglowDb.users.toArray(), limit), [limit]);
}
