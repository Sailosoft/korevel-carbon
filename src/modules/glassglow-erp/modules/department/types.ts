import type { Department } from "../../db/types";

export type DepartmentInput = {
  id?: string;
  name: string;
  code: string;
  description: string;
};

export type DepartmentFilters = {
  search: string;
};

export type DepartmentWithCount = Department & {
  memberCount: number;
};

export type DepartmentOption = {
  value: string;
  label: string;
};

export const DEPARTMENT_CODE_PATTERN = /^[A-Z][A-Z0-9]{1,9}$/;
