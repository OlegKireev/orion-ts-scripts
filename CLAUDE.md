# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

TypeScript development environment for Ultima Online macro scripts targeting the Orion Launcher client. TypeScript files in `src/scripts/` are compiled into `.oajs` files in `dist/` via Rollup. Shared logic lives in `src/lib/`, type definitions in `src/types/`, and game constants in `src/constants/`.

## Commands

```bash
npm run build      # One-time compilation: src/scripts/**/*.ts → dist/**/*.oajs
npm run watch      # Watch mode with auto-rebuild on save (recommended for development)
npm run copy       # Copy dist/ to Orion client (requires ORION_SCRIPTS_PATH in .env)
npm run deploy     # build + copy in sequence
```

There are no tests or linting configured.

## Architecture

### Build Pipeline (rollup.config.js)

Each `src/scripts/**/*.ts` file becomes an independent Rollup entry point. The build:
1. Compiles TypeScript (ES5 target, ESNext modules, strict mode)
2. Tree-shakes unused code — **functions must be `export`ed to survive** (non-exported functions are removed)
3. Replaces `process.env.TG_BOT_TOKEN`, `TG_CHAT_ID`, `TG_THREAD_ID` with values from `.env`
4. Strips final `export {}` blocks via custom `removeExportsPlugin`
5. Preserves directory structure: `src/scripts/craft/blacksmithing.ts` → `dist/craft/blacksmithing.oajs`

Files in `src/lib/` are NOT compiled independently — they are bundled into scripts that import them.

### Path Aliases (tsconfig.json)

- `@/*` → `src/*`
- `@lib/*` → `src/lib/*`

### Key Libraries (`src/lib/`)

- **crafting-engine.ts**: `UniversalCrafter` class — configurable crafting engine with `CraftConfig`/`CraftRecipe` interfaces. Supports `spam` mode (continuous crafting) and `set` mode (craft one of each recipe per set). Used by all craft scripts.
- **helpers.ts**: `checkLag()`, `stopBot()` — core utilities used across all scripts
- **container.ts**: `openContainer()`, `restockItems()` — container management
- **validators.ts**: `toSerial()`, `toGraphic()` — validate hex serial/graphic strings against regex patterns. Always use these when defining serial/graphic constants.
- **status-monitor.ts**: `Monitor()` — background event detection with Telegram alerts
- **loot.ts**, **resurrect.ts**, **eating.ts**, **hidding.ts** — specialized game mechanics

### Type System (`src/types/`)

- `Serial`: string type for object serial numbers (e.g., `'0x403853AB'`)
- `Graphic`: string type for item graphics (e.g., `'0x1BEF'`, supports pipe-separated: `'0x1BEF|0x1BE3'`)
- `Point2D`: `{ x: number; y: number }`
- `orion.d.ts`: Complete `Orion` namespace API with methods for items, movement, combat, UI, journal, etc.

### Script Patterns

Scripts export functions that become available in the Orion UI:

```typescript
import { UniversalCrafter } from '@/lib/crafting-engine';
import { toSerial, toGraphic } from '@lib/validators';

const CONTAINER = toSerial('0x403853AB');

export function Autostart(): void {
  Orion.Exec('Monitor', true);  // start background scripts
  // main logic
}
```

`Autoload.ts` is a special entry point that re-exports common functions from libraries.

## Conventions

- **Language**: Code comments and UI strings are in Russian
- **Commits**: Conventional format — `type(scope): description` (e.g., `feat(resisting): create`, `fix(blacksmith): update craft items`)
- **Branching**: Feature branches off `master`, merge via pull requests
- **Never edit `dist/`** — it's regenerated on every build
