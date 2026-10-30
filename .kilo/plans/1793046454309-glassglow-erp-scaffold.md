# Glassglow ERP scaffold + Users CRUD

## Goal

Create a self-contained MUI + Dexie mock ERP module at `src/modules/glassglow-erp`, reachable at `/modules/glassglow-erp` and listed in the app catalog. First feature: full Users CRUD backed by a local Dexie database.

## Confirmed decisions

- **Scope:** module folder + Next.js routes + catalog registry entry.
- **Isolation:** fully self-contained. No imports from `carbon-portal`, `catalog`, or `src/shared`. Glassglow gets its own theme provider, shared components, DB, hooks, lib, services, and stores.
- **User model:** standard ERP user with roles/status/department and timestamps; no auth or passwords.
- **CRUD depth:** DataGrid list, search, role/status filters, pagination, add/edit dialog with validation, delete confirmation, Snackbar feedback, ~12 seeded users. Hard delete.
- **Architecture:** feature-owned user logic; top-level folders hold cross-cutting concerns.
- **Home:** simple live dashboard (user KPIs + recent users + shortcut to Users).
- **Theme:** light glassmorphism-lite (indigo/cyan, translucent glass surfaces, subtle glow), MUI only.
- **No new dependencies.** Do not add `@mui/icons-material`; use text labels/inline SVG where needed.
- **DB:** new Dexie database named `glassglow-erp`, version 1, no migrations.

## Constraints

- Read the relevant guide in `node_modules/next/dist/docs/` before writing route/layout code (Next 16 has breaking changes), and mirror the working patterns already used by the Carbon Portal routes.
- `src/app` contains routing only. All implementation lives under `src/modules/glassglow-erp`.
- Every import inside Glassglow must resolve within `src/modules/glassglow-erp` (React/Next/MUI/Dexie/zustand packages are fine).
- Use `bun` for scripts: `bun run lint`, `bun run typecheck`, `bun run build`.
- Keep files focused; split components when a file grows large.
- No comments unless they explain non-obvious behavior.

## Target tree

```text
src/modules/glassglow-erp/
├── modules/
│   └── user/
│       ├── components/
│       │   ├── UserOverview.tsx      # home: KPI cards, recent users, link to Users
│       │   ├── UsersPage.tsx         # page composition + snackbar wiring
│       │   ├── UsersToolbar.tsx      # search, role/status filters, Add user
│       │   ├── UsersTable.tsx        # DataGrid + edit/delete actions
│       │   ├── UserDialog.tsx        # create/edit form + validation
│       │   ├── DeleteUserDialog.tsx  # confirm destructive action
│       │   └── UserChips.tsx         # RoleChip, UserStatusChip
│       ├── hooks/
│       │   └── useUsers.ts           # live queries + derived stats/recent list
│       ├── services/
│       │   ├── userService.ts        # create/update/delete + email uniqueness
│       │   └── userStats.ts          # computeUserStats, recentUsers, filterUsers
│       ├── stores/
│       │   └── userTableStore.ts     # zustand: search/role/status filters
│       ├── types.ts                  # UserInput, filter types, label maps
│       └── index.ts
├── shared/
│   ├── components/
│   │   ├── GlassglowThemeProvider.tsx
│   │   ├── GlassglowBootstrap.tsx    # seed once, loading/error states
│   │   ├── GlassglowNav.tsx          # glass AppBar + tabs + catalog link
│   │   ├── GlassglowSnackbar.tsx     # global feedback from uiStore
│   │   ├── GlassPanel.tsx            # glass Card wrapper
│   │   ├── PageHeader.tsx
│   │   ├── StatCard.tsx
│   │   ├── ConfirmDialog.tsx
│   │   └── EmptyState.tsx
│   └── navigation.ts                 # typed nav items
├── db/
│   ├── types.ts                      # User, UserRole, UserStatus
│   ├── indexes.ts                    # STORE constant
│   ├── schema.ts                     # SCHEMA_VERSION = 1, unique email index
│   ├── database.ts                   # GlassglowDB + glassglowDb
│   ├── seedData.ts                   # 12 deterministic users
│   └── seed.ts                       # seedIfEmpty()
├── docs/
│   └── architecture.md               # tree, dependency rules, how to add a module
├── hooks/
│   └── useDebouncedValue.ts
├── lib/
│   ├── format.ts                     # getInitials, formatDate, formatDateTime
│   └── validation.ts                 # normalizeEmail, isValidEmail, requiredText
├── services/
│   └── seedService.ts                # seedIfEmpty wrapper used by bootstrap
├── stores/
│   └── uiStore.ts                    # snackbar state (message, severity)
├── index.ts                          # public barrel
└── theme.ts                          # glassglowThemeOptions + GLASS_PANEL_SX
```

## Data model

```ts
export type UserRole = "admin" | "manager" | "staff" | "viewer";
export type UserStatus = "active" | "invited" | "suspended";

export interface User {
  id: string;              // usr-<uuid>
  name: string;
  email: string;           // normalized lowercase, unique
  role: UserRole;
  status: UserStatus;
  department: string;
  lastActiveAt: string | null; // ISO datetime or null
  createdAt: string;       // ISO datetime
  updatedAt: string;       // ISO datetime
}
```

Dexie schema: `users: "id, &email, role, status, [role+status], createdAt"`. Database name `glassglow-erp`, single version.

## Users CRUD behavior

- **Create/update:** trim name/department, normalize email to lowercase. Reject invalid email, empty name, and duplicate email (case-insensitive, excluding the current record). Throw a normal `Error` with a user-facing message; the dialog displays it.
- **Create defaults:** `id = usr-${crypto.randomUUID()}`, `createdAt/updatedAt = now`, `lastActiveAt = status === "active" ? now : null`.
- **Update:** preserve `createdAt` and existing `lastActiveAt`; update `updatedAt`.
- **Delete:** hard delete after confirmation; show Snackbar.
- **List:** sort by `createdAt` descending; derived filtering in `userStats.ts`, not stored.
- **Search:** case-insensitive across name, email, department.
- **Filters:** role and status selects with an "All" option; filters live in `userTableStore` and reset via a Clear filters action.
- **Table:** `@mui/x-data-grid` v9 (`GridColDef`, `GridActionsCellItem`), client pagination (10/25/50, default 10), loading state while live query is undefined, empty state overlay. Actions use text labels instead of an icons package.
- **Dashboard:** total/active/invited/suspended KPI cards, 5 most recent users with role/status chips, button to `/modules/glassglow-erp/users`.
- **Seed:** 12 deterministic fictional users (varied roles/statuses/departments, fixed ISO dates, unique `@glassglow.io` emails). `seedIfEmpty()` only writes when `users.count() === 0`.

## Theme

`theme.ts` exports:

- `glassglowThemeOptions: ThemeOptions` — light palette, primary indigo (`#4f46e5`), secondary cyan (`#0891b2`), soft indigo background, 16px card radius, `textTransform: none` buttons, glass AppBar (`rgba(255,255,255,0.72)` + `backdropFilter: blur(12px)`), translucent bordered cards, DataGrid header/background overrides.
- `GLASS_PANEL_SX` — shared sx object for translucent panel surfaces used by `GlassPanel` and Stat cards.

`GlassglowThemeProvider` creates the theme from these options and renders `CssBaseline`; it does not import `src/shared`.

## Routes and registry

- `src/app/modules/glassglow-erp/layout.tsx` — server layout: metadata `Glassglow ERP`, wraps `GlassglowThemeProvider` → `GlassglowBootstrap` → `GlassglowNav` → `Container` main.
- `src/app/modules/glassglow-erp/page.tsx` — renders `UserOverview`.
- `src/app/modules/glassglow-erp/users/page.tsx` — renders `UsersPage`.
- `src/modules/registry.ts` — append:
  - id `glassglow-erp`
  - name `Glassglow ERP`
  - short ERP description
  - href `/modules/glassglow-erp`
  - status `available`
- Do not modify catalog visuals/glyphs; the registry's monogram fallback is sufficient.

## Public barrel

`src/modules/glassglow-erp/index.ts` exports the page components, provider, bootstrap, nav, theme options, `glassglowDb`, `seedIfEmpty`, and the `User` types. Route files import only from the barrel.

## Ordered tasks

1. **DB layer**
   - `db/types.ts`, `db/indexes.ts`, `db/schema.ts`, `db/database.ts`.
   - `db/seedData.ts` (12 users) and `db/seed.ts` (`seedIfEmpty`).
2. **Theme + shared UI**
   - `theme.ts` with palette/component overrides and `GLASS_PANEL_SX`.
   - `shared/navigation.ts` with Overview/Users/Catalog entries typed as Next `Route`.
   - Shared components: provider, bootstrap, nav, snackbar, glass panel, page header, stat card, confirm dialog, empty state.
3. **Cross-cutting utilities**
   - `lib/format.ts`, `lib/validation.ts`, `hooks/useDebouncedValue.ts`.
   - `stores/uiStore.ts` (snackbar) and `services/seedService.ts`.
4. **User domain logic**
   - `modules/user/types.ts` (`UserInput`, labels).
   - `userService.ts` with create/update/delete and uniqueness checks.
   - `userStats.ts` with stats, recent users, filtering.
   - `useUsers.ts` live-query hooks.
   - `userTableStore.ts` filter state.
5. **User UI**
   - Toolbar, DataGrid table, create/edit dialog, delete confirmation, chips.
   - `UsersPage`, then `UserOverview` dashboard.
   - Module `index.ts` and top-level `index.ts`.
6. **Routing + registry**
   - Add the three route files and the registry entry.
7. **Docs**
   - `docs/architecture.md`: folder purpose, dependency direction, seed/DB reset instructions, and steps to add the next ERP module.
8. **Validation**
   - `bun run lint`, `bun run typecheck`, `bun run build`.
   - Manual smoke checks listed below.

## Validation checklist

- Catalog shows **Glassglow ERP** as available and launches the route.
- First visit seeds IndexedDB once; reload keeps the same data without reseeding.
- Dashboard counts match the seeded/edited user list.
- Create, edit, delete all work; duplicate/invalid email is rejected inline.
- Search and role/status filters combine correctly; pagination works.
- Refreshing the page preserves changes; deleting the last matching row shows the empty state.
- `/modules/carbon-portal` and the catalog still work; no cross-module imports.
- No new dependencies; lint/typecheck/build pass.

## Risks / notes

- Next 16 and MUI 9 differ from older APIs; follow the local Next docs and the existing Carbon Portal patterns (client components, `Grid size={{...}}`, DataGrid v9 props).
- A second MUI theme exists only inside the Glassglow layout, so it will not affect other routes.
- Lowercase email normalization plus the Dexie `&email` index is the uniqueness guard; the service must normalize before every read/write.
- `crypto.randomUUID` is already used in this repo and works on localhost/HTTPS; keep that assumption.

## Out of scope

- Authentication, login, passwords, role-based permissions/guards.
- Server API, React Query, multi-tenancy.
- Soft delete, audit trail, CSV import/export, avatar uploads, i18n.
- Automated tests (repo has no test setup).
- Editing the catalog's visuals/icons beyond the registry entry.
