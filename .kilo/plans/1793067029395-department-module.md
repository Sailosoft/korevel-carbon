# Add Department Module and Link Users

## Goal

Add a first-class `Department` entity (CRUD) to the Glassglow ERP module and replace the
free-text `User.department` string with a required `User.departmentId` foreign key. Existing
local IndexedDB data must be migrated automatically.

## Decisions (confirmed)

- **Link model:** `User.departmentId: string` foreign key; remove `User.department`.
- **Department fields:** `id`, `name` (unique), `code` (unique), `description?`,
  `createdAt`, `updatedAt`. Member count is derived from users, never stored.
- **User requirement:** every user must reference an existing department.
- **Delete policy:** block deleting a department that still has assigned users; show the count.
- **Existing data:** Dexie version bump with an automatic upgrade that derives departments from
  the old free-text values.
- **UI scope:** Department CRUD page (searchable table, member counts, add/edit/delete),
  plus a Department filter and resolved department name in the Users screen.
- **Out of scope:** department detail routes, department head/manager, archiving, overview
  stat changes, deep links that pre-set the Users filter.

## Conventions to follow

- Module folder: `src/modules/glassglow-erp/modules/department/` (singular, mirrors `modules/user`).
- App Router stays thin: only a route page re-exports the module component.
- MUI components, `GlassPanel`, `PageHeader`, `EmptyState`, `ConfirmDialog`, `StatCard` reuse.
- Logic separated from components: `services/` for validation + Dexie writes, `hooks/` for
  live queries, `stores/` for table filter state.
- No source comments unless already required by the surrounding style.
- Read `node_modules/next/dist/docs/` (routing/app-router guide) before writing the route page if
  available; the page must copy the existing `users/page.tsx` pattern.

## Files to create

```
src/modules/glassglow-erp/db/migrations.ts
src/modules/glassglow-erp/modules/department/index.ts
src/modules/glassglow-erp/modules/department/types.ts
src/modules/glassglow-erp/modules/department/stores/departmentTableStore.ts
src/modules/glassglow-erp/modules/department/hooks/useDepartments.ts
src/modules/glassglow-erp/modules/department/services/departmentService.ts
src/modules/glassglow-erp/modules/department/services/departmentStats.ts
src/modules/glassglow-erp/modules/department/components/DepartmentsPage.tsx
src/modules/glassglow-erp/modules/department/components/DepartmentsToolbar.tsx
src/modules/glassglow-erp/modules/department/components/DepartmentsTable.tsx
src/modules/glassglow-erp/modules/department/components/DepartmentDialog.tsx
src/modules/glassglow-erp/modules/department/components/DeleteDepartmentDialog.tsx
src/modules/glassglow-erp/modules/department/components/DepartmentChips.tsx
src/app/modules/glassglow-erp/departments/page.tsx
```

## Files to modify

```
src/modules/glassglow-erp/db/types.ts
src/modules/glassglow-erp/db/indexes.ts
src/modules/glassglow-erp/db/schema.ts
src/modules/glassglow-erp/db/database.ts
src/modules/glassglow-erp/db/seedData.ts
src/modules/glassglow-erp/db/seed.ts
src/modules/glassglow-erp/modules/user/types.ts
src/modules/glassglow-erp/modules/user/services/userService.ts
src/modules/glassglow-erp/modules/user/services/userStats.ts
src/modules/glassglow-erp/modules/user/stores/userTableStore.ts
src/modules/glassglow-erp/modules/user/components/UsersPage.tsx
src/modules/glassglow-erp/modules/user/components/UsersTable.tsx
src/modules/glassglow-erp/modules/user/components/UsersToolbar.tsx
src/modules/glassglow-erp/modules/user/components/UserDialog.tsx
src/modules/glassglow-erp/modules/user/components/UserOverview.tsx
src/modules/glassglow-erp/modules/user/index.ts
src/modules/glassglow-erp/shared/navigation.ts
src/modules/glassglow-erp/index.ts
```

## Implementation steps

### 1. Data model and Dexie schema v2

1. In `db/types.ts`, add:
   ```ts
   export interface Department {
     id: string;
     name: string;
     code: string;
     description: string;
     createdAt: string;
     updatedAt: string;
   }
   ```
   (`description` stored as `""` when omitted, matching the string-based mock style.)
   Change `User.department: string` to `User.departmentId: string`.
2. `db/indexes.ts`: add `departments: "departments"` to `STORE`.
3. `db/schema.ts`:
   - Set `SCHEMA_VERSION = 2`.
   - Keep the v1 users schema as an explicit legacy constant.
   - v2 users: `"id, &email, role, status, departmentId, [role+status], createdAt"`.
   - v2 departments: `"id, &name, &code, createdAt"`.
4. `db/database.ts`: declare the `departments` table (`EntityTable<Department, "id">`) and register
   `version(1)` with the legacy schema, then `version(2).stores(SCHEMA).upgrade(migrateDepartmentsV2)`
   from `db/migrations.ts`.

### 2. Automatic upgrade (`db/migrations.ts`)

`migrateDepartmentsV2` receives the Dexie upgrade transaction:

- Read all legacy users where `department` is a string (trimmed, skip blanks).
- Deduplicate names case-insensitively; for each unique name create a Department with
  `id: crypto.randomUUID()`, `name` as first-seen trimmed value, and a generated unique `code`.
- `deriveDepartmentCode(name, usedCodes)`: uppercase letters/digits only, first 3 characters
  (fallback `DEPT`), append `2`, `3`, … until unique.
- Put the departments, then rewrite every legacy user: add `departmentId`, delete the
  `department` property, and `put` the updated row. Keep `createdAt`/`updatedAt` untouched.
- Use a local `LegacyUser` type; do not reference the removed `User.department` field in app code.
- Users with no usable department (blank/missing) must still get a department: reuse/create
  `Unassigned` with code `UNASSIGNED` (or `DEPT`), because the field is required.

### 3. Seed data

1. Add `SEED_DEPARTMENTS` to `db/seedData.ts` with deterministic ids (`dpt-…` pattern) for the
   existing user department names: Operations `OPS`, Finance `FIN`, Engineering `ENG`,
   Procurement `PRC`, Sales `SAL`, IT `IT`, Logistics `LOG`, Product `PRD`. Include short
   descriptions and fixed ISO timestamps.
2. Replace every `department: "…"` in `SEED_USERS` with the matching `departmentId`.
3. Rewrite `db/seed.ts` so seeding is all-or-nothing:
   - Open the DB.
   - If `departments.count() === 0` **and** `users.count() === 0`, write both seeds inside one
     `db.transaction("rw", db.departments, db.users, …)`.
   - If either table has rows, seed nothing (prevents referencing missing departments after the
     upgrade path or user edits). Keep the existing `seedInFlight` retry behavior.

### 4. Department module

**`types.ts`**
- `DepartmentInput = { id?: string; name: string; code: string; description: string }`
- `DepartmentFilters = { search: string }`
- `DepartmentWithCount = Department & { memberCount: number }`
- `DEPARTMENT_CODE_PATTERN = /^[A-Z][A-Z0-9]{1,9}$/`

**`services/departmentService.ts`**
- `saveDepartment(input)`:
  - `name = requiredText(input.name, "Department name")`
  - `code = requiredText(input.code, "Code").toUpperCase()`; must match
    `DEPARTMENT_CODE_PATTERN`, else throw `Code must be 2–10 letters or digits and start with a letter.`
  - `description = input.description.trim()`
  - Reject duplicate name (case-insensitive) and duplicate code with messages naming the field
    and value; when editing, exclude the current id.
  - Create `{ id: "dpt-" + crypto.randomUUID(), createdAt, updatedAt }` or preserve existing
    `createdAt` and bump `updatedAt`.
- `deleteDepartment(id)`:
  - Load the department; throw if missing.
  - `count = await glassglowDb.users.where("departmentId").equals(id).count()`.
  - If `count > 0`, throw `Cannot delete ${name}: ${count} user(s) are still assigned. Reassign them first.`
  - Otherwise delete the department.
- Keep all writes in Dexie transactions where more than one table is read/written.

**`services/departmentStats.ts`**
- `sortDepartmentsByName(departments)` (locale compare on `name`).
- `filterDepartments(departments, filters)` searching name, code and description.
- `countMembersByDepartment(users)` returning `Map<string, number>`.
- `attachMemberCounts(departments, counts)` returning `DepartmentWithCount[]`.

**`hooks/useDepartments.ts`**
- `useDepartments()` → live query, sorted by name.
- `useDepartmentsWithCounts()` → live query over departments + users, returning
  `DepartmentWithCount[]`.
- `useDepartmentOptions()` → `{ value, label: "CODE — Name" }[]` for selects.
- Use `dexie-react-hooks` `useLiveQuery` with explicit dependency arrays, mirroring `useUsers`.

**`stores/departmentTableStore.ts`**
- Zustand store with `search`, `setSearch`, `resetFilters` (same shape as `userTableStore`).

**Components (MUI, mirror the Users screen)**
- `DepartmentsPage`: `PageHeader` ("Departments", subtitle mentions user assignments),
  toolbar, table, footer count text (`x of y departments shown · stored locally in IndexedDB`),
  `DepartmentDialog`, `DeleteDepartmentDialog`.
- `DepartmentsToolbar`: search field ("Search departments", placeholder "Name, code or
  description"), Clear filters, Add department button.
- `DepartmentsTable`: DataGrid inside `GlassPanel`, columns Code (chip), Name, Description
  (truncated, `—` when empty), Members (count), Created (`formatDate`), actions Edit/Delete.
  Disable the Delete action when `memberCount > 0`; still keep the service guard. Use
  `EmptyState` for the no-rows overlay.
- `DepartmentChips`: small code chip using `alpha` tinting, similar to `UserChips`.
- `DepartmentDialog`: fields Name (required, autofocus), Code (required, upper-case on change,
  helper text about format), Description (multiline, optional). State reset on open/id change
  using the same `previous` pattern as `UserDialog`; inline `Alert` for service errors;
  snackbar success via `useUiStore`.
- `DeleteDepartmentDialog`: wraps `ConfirmDialog`, destructive, shows the blocked-service error
  if it occurs.
- `index.ts`: export `DepartmentsPage`, hooks, services, and types.

### 5. Routes, navigation, barrels

- `src/app/modules/glassglow-erp/departments/page.tsx`:
  ```tsx
  import { DepartmentsPage } from "@/modules/glassglow-erp";

  export default function GlassglowDepartmentsPage() {
    return <DepartmentsPage />;
  }
  ```
- `shared/navigation.ts`: add to the `People` group after Users:
  `{ label: "Departments", href: "/modules/glassglow-erp/departments", icon: ApartmentOutlined }`.
- `src/modules/glassglow-erp/index.ts`: export `DepartmentsPage` and the `Department` type.

### 6. Link users to departments

1. **`user/types.ts`**
   - `UserInput.departmentId: string` (replaces `department`).
   - `UserFilters` adds `departmentId: string | null`.
2. **`userTableStore.ts`**: add `departmentId: string | null`, `setDepartmentId`, include it in
   `resetFilters`.
3. **`userService.ts`**
   - Replace the free-text required check with `requiredText(input.departmentId, "Department")`.
   - Verify `await glassglowDb.departments.get(departmentId)` exists; otherwise throw
     `Select a valid department.`
   - Write `departmentId` on create and update.
4. **`userStats.ts`**
   - `filterUsers(users, filters, departmentsById: Map<string, Department>)`.
   - Apply `filters.departmentId` equality.
   - Include resolved department `name` and `code` in search matching; missing departments must
     not throw (fall back to `""`).
5. **`UsersPage.tsx`**
   - Fetch `useDepartments()` and build a memoized `Map<string, Department>`.
   - Pass the map into `filterUsers`, `UsersTable`, and the dialog where needed.
   - Show a `CircularProgress`/loading state only when both users and departments are unresolved.
6. **`UsersTable.tsx`**
   - Replace the `department` column with `field: "departmentId"`, header "Department".
   - Render department name (and code caption) from the map; `—`/`Unknown` when missing.
   - Add a `valueGetter` returning the resolved name so sorting by department is meaningful.
7. **`UsersToolbar.tsx`**
   - Add a Department `Select` filter using `useDepartmentOptions`, with an `All departments`
     option bound to `departmentId` in the store. Keep the existing Role/Status filters and
     `hasFilters` logic (include the new field).
8. **`UserDialog.tsx`**
   - Fetch department options; replace the free-text field with a required `Select`.
   - `FormState.departmentId: string`; new users default to `""` and the Select shows a disabled
     "Select a department" placeholder until chosen.
   - If there are no departments, show an info `Alert` with a link to `/modules/glassglow-erp/departments`
     and disable the submit button (a user cannot be saved without one).
   - On save pass `departmentId` to `saveUser`.
9. **`UserOverview.tsx`**
   - Fetch `useDepartments()` (or a lookup hook) and show the resolved department name in the
     recent-users caption instead of `user.department`. Use `—` while unresolved/missing.
10. **`modules/user/index.ts`**: keep the existing exports unchanged; user components import
    department hooks directly from `../department` to avoid a second public surface.

### 7. Validation and cleanup

- Grep for `department` across `src/` and ensure no remaining free-text reads/writes; keep
  `departmentId` only.
- Confirm every new file follows the existing import ordering, `"use client"` placement for
  interactive components, and MUI v9 `Grid size={{ … }}` usage.
- Ensure no module cycle: `department` may import `db/*` and `shared/*` and `stores/uiStore`;
  the `user` module imports the `department` module, never the reverse.

## Failure modes and edge cases

- **Upgrade with duplicate/mixed-case old names** (e.g. "Finance", "finance"): collapse to one
  department; every user keeps a valid `departmentId`.
- **Upgrade with blank/missing department:** assign the fallback `Unassigned` department so the
  required invariant holds.
- **Departments already exist but users table was cleared:** seeder must not reinsert seed users
  pointing at potentially edited department ids; all-or-nothing seeding handles this.
- **No departments available when adding a user:** dialog blocks submission with a link to create
  one.
- **Deleting a department concurrently with assigning a user:** delete runs in a transaction and
  counts users at delete time; either the count blocks deletion or the user save fails the
  department-exists check.
- **Department renamed:** users need no writes; all screens resolve names by id on live queries.
- **Unknown `departmentId` (corrupt/reset data):** tables render `—`/`Unknown`, search ignores it,
  and saving the user requires a valid selection.

## Validation plan

1. `bun run typecheck`
2. `bun run lint`
3. `bun run build`
4. Manual checks in `bun run dev` (port 4020):
   - Fresh browser profile: Departments page lists 8 seeded departments with correct member
     counts; Overview and Users show resolved names.
   - Upgrade path: with an existing v1 database, reload; IndexedDB version becomes 2, derived
     departments appear, users retain assignments, old `department` property is gone.
   - Create a department; reject duplicate name and duplicate/invalid code; edit name and verify
     it updates on the Users page and Overview without touching user records.
   - Attempt to delete a department with members → blocked with count message; delete an empty
     department → succeeds.
   - Add a user: department select is required; save without one shows an error; with no
     departments the submit is disabled and the link works.
   - Filter Users by department; search by department name and code; edit a user's department and
     watch both pages' counts update.
   - Delete a user and confirm the department member count decreases.
