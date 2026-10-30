# Fix hydration mismatch on /modules/glassglow-erp

## Root cause

MUI (Emotion) is server-rendered without an App Router Emotion cache provider.
On the server, Emotion injects `<style data-emotion="css-global ...">` tags
**inline in the body**; on the client it inserts styles into `<head>`. The
resulting DOM differs at hydration — exactly the diff React logged inside
`GlassglowBootstrap` (`+ <div className="MuiBox-root css-o8eraw">` vs
`- <style data-emotion="css-global ...">`).

`GlassglowBootstrap` itself is innocent (its `ready=false` initial state matches
on both sides). Any MUI page would hit this; catalog/carbon-portal likely have
the same latent issue.

Fix per MUI official docs: install `@mui/material-nextjs` and wrap the app in
`AppRouterCacheProvider` so server CSS is collected into `<head>` and the trees
match.

## Changes

1. **Install** (bun, per AGENTS.md):
   ```
   bun add @mui/material-nextjs @emotion/cache
   ```
   `@mui/material-nextjs@9.5.0` supports Next 16 via the `v16-appRouter` entry
   (peer: `next ^16`, `react ^19` — both match this repo).

2. **`src/app/layout.tsx`** — wrap `{children}` inside `<body>` with the cache
   provider (root layout, so catalog + carbon-portal + glassglow-erp all benefit):

   ```tsx
   import { AppRouterCacheProvider } from "@mui/material-nextjs/v16-appRouter";
   // ...
   <body className="min-h-full flex flex-col">
     <AppRouterCacheProvider>{children}</AppRouterCacheProvider>
   </body>
   ```

   No options needed (default `key: "mui"` is fine; no custom Emotion cache exists
   in this repo).

## Files touched

- `package.json` / `bun.lock` — new deps
- `src/app/layout.tsx` — add `AppRouterCacheProvider`

## Verification

1. `bun run typecheck`
2. `bun run dev`, load `/modules/glassglow-erp` — hydration error in console gone.
3. Spot-check `/` (catalog) and `/modules/carbon-portal` for the same console error.

## Out of scope

- No changes to `GlassglowBootstrap` / `GlassglowThemeProvider` (their code is correct).
- Not adding `suppressHydrationWarning` (treats the symptom, not the cause).
