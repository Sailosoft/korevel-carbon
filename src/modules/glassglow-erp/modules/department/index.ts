export { DepartmentsPage } from "./components/DepartmentsPage";
export {
  useDepartmentOptions,
  useDepartments,
  useDepartmentsWithCounts,
} from "./hooks/useDepartments";
export { deleteDepartment, saveDepartment } from "./services/departmentService";
export type {
  DepartmentFilters,
  DepartmentInput,
  DepartmentOption,
  DepartmentWithCount,
} from "./types";
