# Glassglow ERP AppShell (sidebar navigation with groups)

## Goal

Replace the top Tabs nav (`GlassglowNav`) in `src/modules/glassglow-erp` with a sidebar-only
AppShell: grouped navigation, collapsible to an icon-only mini rail on desktop, temporary
drawer on mobile. No top bar — branding, nav, and the Catalog link all live in the sidebar.

## Decisions (confirmed with user)

- **Sidebar only, no top bar.** `GlassglowNav` Tabs component is deleted.
- **Desktop (md+):** persistent sidebar, collapsible to icon-only mini rail; collapsed
  state persisted to localStorage via zustand `persist`.
- **Mobile (<md):** temporary MUI `Drawer` opened by a bottom-left `Fab`; standard
  auto-close on nav click, backdrop click, and Esc. (Resolves the original "do not auto
  close" note: the desktop permanent sidebar never closes; the user explicitly chose
  standard auto-close for the mobile drawer.)
- **Icons:** add `@mui/icons-material` via `bun add` (per repo AGENTS.md preference).
- Module isolation rule stays: no `@/shared` or cross-module imports; everything lives in
  `src/modules/glassglow-erp`.

## Verified facts (checked against installed packages)

- MUI **v9** `Drawer` (`node_modules/@mui/material/Drawer/Drawer.d.ts`):
  - `variant="permanent" | "persistent" | "temporary"` intact.
  - `ModalProps` still exists (use `ModalProps={{ keepMounted: true }}` on temporary).
  - **`PaperProps` prop is gone** — paper styling must use
    `slotProps={{ paper: { sx: {...} } }}`.
- zustand **v5** (`node_modules/zustand/middleware.d.ts`): `persist` with `partialize`,
  `skipHydration`, and `useUiStore.persist.rehydrate()`. No existing persist usage in the
  repo — first one; follow the shape below.
- Hydration: default `sidebarCollapsed: false` matches SSR. To avoid a React hydration
  mismatch when a user who previously collapsed reloads, use `skipHydration: true` and
  call `useUiStore.persist.rehydrate()` in a `useEffect` in the shell (first paint is
  expanded, then snaps — acceptable flash).
- `GlassglowBootstrap` shows a full-screen loading state before children mount; keep it
  wrapping the shell (loading screen behavior unchanged).
- `GlassglowSnackbar` is position-agnostic; safe to move inside the shell.
- Next 16.3.8, `babel-plugin-react-compiler` active — no non-reactive mutations of
  module-level data.

## Tasks

### 1. Add icons dependency

```bash
bun add @mui/icons-material
```

### 2. Restructure `shared/navigation.ts`

Replace the flat list with groups (keep `CATALOG_HREF`):

```ts
import type { Route } from "next";
import type { SvgIconComponent } from "@mui/icons-material";
import PeopleOutline from "@mui/icons-material/PeopleOutline";
import SpaceDashboardOutlined from "@mui/icons-material/SpaceDashboardOutlined";

export type GlassglowNavItem = { label: string; href: Route; icon: SvgIconComponent };
export type GlassglowNavGroup = { id: string; label: string; items: readonly GlassglowNavItem[] };

export const GLASSGLOW_NAV_GROUPS: readonly GlassglowNavGroup[] = [
  { id: "general", label: "General", items: [
    { label: "Overview", href: "/modules/glassglow-erp", icon: SpaceDashboardOutlined },
  ]},
  { id: "people", label: "People", items: [
    { label: "Users", href: "/modules/glassglow-erp/users", icon: PeopleOutline },
  ]},
];

export const CATALOG_HREF: Route = "/";
```

Remove `GLASSGLOW_NAV` (its only consumer is being deleted).

### 3. Extend `stores/uiStore.ts`

Add persisted sidebar collapse state alongside the existing snackbar state:

```ts
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

type UiState = {
  snackbar: SnackbarMessage | null;
  sidebarCollapsed: boolean;
  notify: (message: string, severity?: SnackbarSeverity) => void;
  dismiss: () => void;
  toggleSidebarCollapsed: () => void;
};

export const useUiStore = create<UiState>()(
  persist(
    (set) => ({
      snackbar: null,
      sidebarCollapsed: false,
      notify: (message, severity = "success") => set({ snackbar: { message, severity } }),
      dismiss: () => set({ snackbar: null }),
      toggleSidebarCollapsed: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
    }),
    {
      name: "glassglow-erp-ui",
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({ sidebarCollapsed: s.sidebarCollapsed }),
      skipHydration: true,
    },
  ),
);
```

Snackbars must never persist. `skipHydration` is required (see Verified facts).

### 4. New `shared/components/GlassglowSidebarContent.tsx` (client)

Presentational sidebar body shared by both drawers. Props:
`{ collapsed: boolean; onNavigate?: () => void; showCollapseToggle: boolean }`.

- **Brand block:** existing "G" gradient logo tile + "Glassglow ERP" `Typography`
  (label hidden when `collapsed`).
- **Nav:** render `GLASSGLOW_NAV_GROUPS`; group headers via `ListSubheader`
  (hidden when collapsed); each item: `ListItemButton component={Link}` +
  `ListItemIcon` + `ListItemText`, wrapped in `Tooltip title={label}` only when
  collapsed.
- **Active state:** `usePathname() === href` **exact match** (Overview
  `/modules/glassglow-erp` must not match `/modules/glassglow-erp/users`); selected
  `ListItemButton` + primary color.
- **Footer** (pinned bottom via `marginTop: "auto"`): collapse toggle
  (`ChevronLeftIcon`/`ChevronRightIcon` IconButton, only when `showCollapseToggle`,
  `aria-label` "Collapse sidebar"/"Expand sidebar") and a Catalog `ListItemButton`
  linking to `CATALOG_HREF` (icon `ArrowOutwardIcon` or `ArrowBackIcon`; label hidden
  when collapsed).
- Nav list scrolls (`overflowY: "auto"`, flex-grow) so brand/footer stay fixed.
- Glass styling consistent with the module: translucent white surface + blur +
  indigo-tinted border (same look as `GLASS_PANEL_SX` / AppBar overrides in
  `theme.ts`; optionally export a shared `GLASS_SIDEBAR_SX` from `theme.ts`).

### 5. New `shared/components/GlassglowAppShell.tsx` (client)

Layout orchestration. Local state `mobileOpen` (not persisted).

- Outer `Box sx={{ display: "flex", minHeight: "100vh" }}`.
- **Desktop drawer:** `Drawer variant="permanent" anchor="left"`
  `sx={{ display: { xs: "none", md: "block" } }}` with
  `slotProps={{ paper: { sx: { width: collapsed ? 76 : 260, boxSizing: "border-box",
  transition: theme.transitions.create("width"), overflowX: "hidden" } } }}`;
  children: `<GlassglowSidebarContent collapsed={collapsed} showCollapseToggle />`.
- **Mobile drawer:** `Drawer variant="temporary" anchor="left" open={mobileOpen}
  onClose={() => setMobileOpen(false)} ModalProps={{ keepMounted: true }}
  sx={{ display: { md: "none" } }}`; children:
  `<GlassglowSidebarContent collapsed={false} showCollapseToggle={false}
  onNavigate={() => setMobileOpen(false)} />`.
  - Note: MUI temporary Drawer already closes on backdrop click and Esc; the
    `onNavigate` callback (invoked from item `onClick` alongside Next `Link`
    navigation) closes it on nav click — standard auto-close behavior. Do not fight
    Link's default navigation.
- `collapsed` comes from `useUiStore((s) => s.sidebarCollapsed)`;
  `toggleSidebarCollapsed` wired to the footer toggle.
- Hydration effect (once on mount):
  `useEffect(() => { void useUiStore.persist.rehydrate(); }, [])`.
- **Mobile menu button:** `Fab color="secondary" size="medium"` fixed
  `bottom: 24, left: 24`, `zIndex: theme.zIndex.speedDial`, `display: { xs: "flex",
  md: "none" }`, `aria-label="Open navigation"`, MenuIcon, glass-styled; `onClick`
  opens the temporary drawer.
- **Main area:** `Box component="main"` flex-grow with the existing background
  gradients (radial indigo/cyan, `backgroundAttachment: "fixed"`) moved from the
  current layout; contains `<Container maxWidth="lg" sx={{ py: 4 }}>{children}</Container>`.
- Mount `GlassglowSnackbar` at the end of the shell (unchanged anchor bottom-center).

### 6. Wire up route layout + barrel

- `src/app/modules/glassglow-erp/layout.tsx`: keep `GlassglowThemeProvider` →
  `GlassglowBootstrap`; replace the background Box + `<GlassglowNav />` + Container
  with `<GlassglowAppShell>{children}</GlassglowAppShell>`. Metadata unchanged.
- `src/modules/glassglow-erp/index.ts`: remove `GlassglowNav` export; export
  `GlassglowAppShell`.
- Delete `shared/components/GlassglowNav.tsx`.

### 7. Docs touch-up

- `docs/architecture.md`: update the `shared/` folder-map line (`navigation.ts` now
  typed groups) and "Adding the next ERP module" step 5 → add items to
  `GLASSGLOW_NAV_GROUPS`; note the AppShell replaced the old top nav.

## Validation

1. `bun run typecheck` and `bun run lint` pass.
2. Manual (`bun run dev`, port 4020):
   - Both routes render with sidebar; exact active highlight (Overview not highlighted
     on `/users`).
   - Desktop: toggle animates 260↔76; labels/group headers hide; tooltips on icons;
     collapsed state survives full reload **without hydration warning in the console**
     (first paint expanded, then snaps).
   - Mobile (<md, responsive mode): FAB opens drawer; clicking a nav item navigates
     and drawer closes; backdrop/Esc close; FAB does not overlap snackbar or
     page-header text.
   - Catalog footer link returns to `/`; Users-page create/delete snackbars still work.
   - localStorage key `glassglow-erp-ui` contains only `{ state: { sidebarCollapsed },
     version: 0 }`.

## Risks / notes

- MUI v9: always style drawer paper via `slotProps.paper`, not `PaperProps`.
- Do not derive `sidebarCollapsed` during SSR/first client render (persist
  `skipHydration` pattern) — prevents React hydration mismatch.
- `babel-plugin-react-compiler` active: keep components free of non-reactive mutations.
- `Route` typing from `next`: keep `href` values typed `as const satisfies` like the
  current file so the barrel and links stay type-safe.
