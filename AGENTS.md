<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Rules
## Bun package manager

prefer `bun add ` over npm as package.
- bun run build
- bun add 


## KeepApp only for routing

keep the app for routing

## Modular approach
Follow modular approach
src\modules\{module}

reference it to src\app for routing

## shared components

put it here possible shared components
src\shared

## Code of Conduct
- When files is getting too long seperate the components in multiple file
- seperate the logic and component
- Do not repeat your self
- SOLID principle


## Offline first database
- this project is to mock up application not actual database
- use dexiejs db for database


## MUI
use mui to create components