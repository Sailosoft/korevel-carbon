# App Catalog + Carbon Portal Module Plan

## Goal

Add an in-app **catalog** at `/` that lists available applications, and add a new
**Carbon Portal** module reachable at `/modules/carbon-portal`, listed in the catalog.

## Resolved Decisions

1. **One document shell only.** Keep a single `src/app/layout.tsx` that renders the
   only `<html>`/`<body>`. It stays framework-minimal (fonts + `globals.css` + base
   metadata). Modules and the catalog use **nested** layouts (own chrome/theme), not
   their own `<html>`/`<body>`.
2. **Catalog route group** `src/app/(catalog)/` maps to URL `/` (route group is not in
   the URL).
3. **Modules route** `src/app/modules/{module}/` maps to `/modules/{module}`.
4. **Module implementation** lives in `src/modules/{module}`; `src/app` holds routing
   only (per AGENTS.md).
5. **Catalog data** = static typed registry at `src/modules/registry.ts` (routing
   metadata, not app data). Dexie is *not* used for the catalog list.
6. **Carbon Portal URL** = `/modules/carbon-portal`.
7. **MUI theming** = one shared client provider `src/shared/components/AppThemeProvider.tsx`
   (`ThemeProvider` + `CssBaseline`), used by the catalog layout and each module layout.
   The root layout does not mount MUI.
8. **Typed routes** enabled (`typedRoutes: true`) so registry `href` values are typed
   with `Route` from `next`.

These are recommended defaults; adjust during implementation if needed.

## Current State (verified)

- Next.js `16.3.8`, React `19.2.8`, MUI `9.4.0`, TypeScript 5, `bun` lockfile present.
- `src/app/layout.tsx` — root layout: Geist fonts, `globals.css`, metadata
  `"Create Next App"`, typed via `LayoutProps<"/">`.
- `src/app/page.tsx` — default create-next-app starter rendered at `/`.
- `src/app/globals.css` — Tailwind v4 + CSS vars.
- `src/modules/` and `src/shared/{components,hooks,lib}` are empty.
- `@mui/material-nextjs` (emotion App Router cache provider) is **not** installed.
- `next.config.ts` has only `reactCompiler: true`; `typedRoutes` not enabled.
- `tsconfig.json` already includes `.next/types/**/*.ts`.

## Target Structure

```
src/
  app/
    layout.tsx                         # MODIFY: only <html>/<body>, minimal, base metadata
    globals.css                        # keep
    (catalog)/
      layout.tsx                       # NEW: AppThemeProvider + simple catalog header
      page.tsx                         # NEW: renders <AppCatalog/>  -> "/"
    modules/
      carbon-portal/
        layout.tsx                     # NEW: AppThemeProvider + module chrome
        page.tsx                       # NEW: renders <CarbonPortalHome/> -> "/modules/carbon-portal"
  modules/
    registry.ts                        # NEW: AppDescriptor[] (typed href: Route)
    catalog/
      components/
        AppCard.tsx                    # NEW
        AppCatalog.tsx                 # NEW
      index.ts                         # NEW: barrel
    carbon-portal/
      components/
        CarbonPortalHome.tsx           # NEW
      theme.ts                         # NEW (optional): MUI theme for this app
      index.ts                         # NEW: barrel
  shared/
    components/
      AppThemeProvider.tsx             # NEW: 'use client' MUI provider
```

## Tasks (ordered)

1. **Delete `src/app/page.tsx`.** It resolves to `/` and will conflict with
   `src/app/(catalog)/page.tsx`.
2. **Update `src/app/layout.tsx`** — keep a single `<html>`/`<body>`, change metadata to a
   base app title (e.g. `Korevel Carbon`) + a `title.template` (e.g. `"%s | Korevel Carbon"`)
   so nested layouts can set per-app titles. No MUI here.
3. **Create `src/shared/components/AppThemeProvider.tsx`**:
   - `'use client'`.
   - `ThemeProvider` + `CssBaseline` from `@mui/material` / `@mui/material/styles`.
   - Optional `theme?: Theme` prop (defaults to a shared base theme).
4. **Create `src/modules/registry.ts`**:
   - `import type { Route } from 'next'`.
   - `export type AppDescriptor = { id: string; name: string; description: string; href: Route; icon?: React.ComponentType; status?: 'available' | 'coming-soon' }`.
   - `export const APP_REGISTRY: AppDescriptor[]` containing the Carbon Portal entry
     (`{ id: 'carbon-portal', name: 'Carbon Portal', href: '/modules/carbon-portal', ... }`).
5. **Create the catalog module `src/modules/catalog/`**:
   - `components/AppCard.tsx` — MUI `Card`/`CardActionArea`/`Typography`, `next/link` to `href`.
   - `components/AppCatalog.tsx` — responsive MUI `Grid`/`Stack` over `APP_REGISTRY`;
     empty state if registry is empty.
   - `index.ts` — re-export `AppCatalog`.
6. **Create `src/app/(catalog)/layout.tsx`** — wrap `children` in `AppThemeProvider`,
   add a lightweight header; export `metadata = { title: 'App Catalog' }`.
7. **Create `src/app/(catalog)/page.tsx`** — render `<AppCatalog />`.
8. **Create the Carbon Portal module `src/modules/carbon-portal/`**:
   - `components/CarbonPortalHome.tsx` — placeholder portal UI (MUI) + a link back to `/`.
   - `theme.ts` — optional `createTheme` override for this app.
   - `index.ts` — barrel.
9. **Create `src/app/modules/carbon-portal/layout.tsx`** — wrap `children` in
   `AppThemeProvider` (passing the module theme), add module chrome; export
   `metadata = { title: 'Carbon Portal' }`.
10. **Create `src/app/modules/carbon-portal/page.tsx`** — render `<CarbonPortalHome />`.
11. **Enable typed routes** in `next.config.ts`: add `typedRoutes: true`.
12. **Add a `typecheck` script** to `package.json`:
    `"typecheck": "next typegen && tsc --noEmit"`.
13. **Generate route types and validate**:
    `bunx next typegen` (or `bun dev`/`bun run build`) then `bun run lint`, `bun run typecheck`.
14. **Add a module-listing pattern for future apps**: document in the registry comment that
    adding an app = new `src/app/modules/{module}/` route pair + `src/modules/{module}/` code
    + one `APP_REGISTRY` entry. (No source duplication.)

## Constraints / Gotchas

- Do **not** add `src/app/modules/page.tsx`; `/modules` has no index route in this plan.
- A nested layout must **not** render `<html>`/`<body>` (only the root layout may).
- `Route` and `LayoutProps<'/...'>` types only exist after `next typegen`/`dev`/`build`.
  Run typegen before type-checking, otherwise new-route type errors are expected.
- Registry `href` values: prefer literal-looking strings typed as `Route` (as in the Next
  docs "type a simple data structure and iterate" pattern). If a non-literal is used, cast
  `as Route`.
- MUI v9 + Next App Router emotion cache provider (`@mui/material-nextjs`) is **not**
  installed. This plan works with plain `ThemeProvider` + `CssBaseline` (possible brief
  FOUC on first paint). Optional enhancement: `bun add @mui/material-nextjs` and wrap each
  app layout in the matching `AppRouterCacheProvider` entrypoint — verify the correct v9
  export path before adding.

## Validation

- `bunx next typegen` succeeds and generates route types for `/`, `/modules/carbon-portal`.
- `bun run lint` passes.
- `bun run typecheck` (after task 12) passes.
- `bun run build` succeeds and route list includes `/` and `/modules/carbon-portal`.
- Manual: `/` shows the catalog with a Carbon Portal card; the card links to
  `/modules/carbon-portal`; that page renders and links back to `/`.

## Risks

- Failing to delete `src/app/page.tsx` causes a duplicate-route build error for `/`.
- Enabling `typedRoutes` before `next typegen` runs can surface transient `Route` type
  errors in the editor; regenerate types after adding routes.
- MUI SSR style extraction may lag without the cache provider (cosmetic only for this mock).

## Out of Scope

- Dexie persistence/seed data for the catalog.
- Auth, routing guards, or per-app `<html>` document shells.
- Actual Carbon Portal domain features (placeholder UI only).
