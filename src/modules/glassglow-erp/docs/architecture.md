# Glassglow ERP architecture

Glassglow ERP is a self-contained mock ERP demo mounted at `/modules/glassglow-erp`. It
uses MUI for UI, Dexie for an offline IndexedDB database, and zustand for table filters and
snackbar feedback. It owns every part of its implementation and shares no runtime code with
other modules.

## Dependency rules

- `src/app/modules/glassglow-erp/*` contains routing only. Route files import from the
  module barrel (`@/modules/glassglow-erp`) and nothing else.
- Every import inside `src/modules/glassglow-erp` resolves within that folder. React, Next,
  MUI, Dexie, and zustand packages are allowed.
- Do not import from `@/modules/carbon-portal`, `@/modules/catalog`, `@/modules/registry`, or
  `@/shared`. The module has its own theme provider, navigation, shared components, format
  helpers, hooks, stores, and database. Duplicating a small helper is intentional: it keeps
  Glassglow independently extractable.
- The only cross-module dependency is one entry in `src/modules/registry.ts`, which the
  catalog reads. The catalog's hash-picked visual and two-letter monogram are its fallback
  for apps without a dedicated glyph, so no catalog visual edits are required.

Dependency direction:

```text
src/app/modules/glassglow-erp  ->  src/modules/glassglow-erp/index.ts (barrel)
                                          |
                     modules/user -> shared components, db, lib, hooks, stores
                                          |
                    domain services -> Dexie database / pure helpers
```

## Folder map

```text
src/modules/glassglow-erp/
├── modules/user/            # feature-owned user domain
│   ├── components/          # pages, table, toolbar, dialogs, chips
│   ├── hooks/               # live Dexie queries and derived stats
│   ├── services/            # create/update/delete + pure filtering/stats
│   ├── stores/              # user table filter state
│   ├── types.ts             # UserInput, filters, labels
│   └── index.ts
├── shared/
│   ├── components/          # theme provider, bootstrap, app shell, sidebar, snackbar, glass UI
│   └── navigation.ts        # typed sidebar nav groups (Overview/Users) + Catalog route
├── db/                      # Dexie types, schema, database, seed
├── services/seedService.ts  # bootstrap-facing seed wrapper
├── stores/uiStore.ts        # global snackbar queue + persisted sidebar collapse
├── hooks/                   # cross-feature hooks
├── lib/                     # formatting and validation helpers
├── theme.ts                 # theme options + GLASS_PANEL_SX
└── index.ts                 # public barrel
```

## Data flow

1. `GlassglowBootstrap` runs `ensureSeeded()` once on mount. `seedIfEmpty()` writes the 12
   deterministic users only when `users.count() === 0`, guarded by an in-flight promise so
   StrictMode and multiple mounts cannot double-seed.
2. Screens read through `dexie-react-hooks` (`useUsers`, `useUserStats`, `useRecentUsers`).
   These return `undefined` while loading and update automatically after writes.
3. Mutations go through `userService.ts`. It trims text, normalizes email to lower-case,
   validates the email, checks uniqueness excluding the edited record, and sets timestamps.
4. Derived values are never stored. Stats, recent-user lists, and filtering live in
   `userStats.ts` and run over live query results.
5. Success and error feedback goes through `useUiStore().notify()`. `GlassglowSnackbar` is
   mounted once inside `GlassglowAppShell`, which the route layout wraps around pages.

## Database and reset

- Database name: `glassglow-erp`, schema version 1, single `users` store.
- Indexes: `id, &email, role, status, [role+status], createdAt`. The unique lower-case
  `email` index is the last line of defense; the service pre-checks it for friendly errors.
- To reset the demo: open browser DevTools → Application → IndexedDB → delete the
  `glassglow-erp` database, then reload the page. The bootstrap reseeds it.
- There are no migrations. Changing the schema means bumping the version or deleting the
  local database during development.

## Adding the next ERP module

1. Create `src/modules/glassglow-erp/modules/<module>/` with `types.ts`, `services/`,
   `hooks/`, `stores/`, `components/`, and an `index.ts`.
2. Add the reusable surface to `src/modules/glassglow-erp/shared/` only if two features
   genuinely need it; otherwise keep it inside the feature.
3. Export the page component from the feature barrel and the module barrel.
4. Add `src/app/modules/glassglow-erp/<module>/page.tsx` that renders the barrel export.
5. If the module gets its own top-level route, add a nav item to the right group in
   `shared/navigation.ts` (`GLASSGLOW_NAV_GROUPS`, typed as a Next `Route`). The sidebar
   app shell picks it up automatically.

All new code must keep the isolation rule: no `@/shared`, no other module imports.
