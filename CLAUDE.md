# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

TypeScript development environment for Ultima Online macro scripts targeting the Orion Launcher client. TypeScript files in `src/scripts/` are compiled into self-contained `.oajs` files in `dist/`. Shared logic lives in `src/lib/`, type definitions in `src/types/`, and game constants in `src/constants/`.

## Commands

```bash
npm run build      # One-time compilation: src/scripts/**/*.ts → dist/**/*.oajs
npm run watch      # Watch mode with auto-rebuild on save (recommended for development)
npm run copy       # Copy dist/ to Orion client (requires ORION_SCRIPTS_PATH in .env)
npm run deploy     # build + copy in sequence
npm run typecheck  # Type-check without emitting (tsc --noEmit)
```

There are no tests or linting configured.

## Architecture

### Build Pipeline (build.js)

Two-phase build: `tsc` compiles once, then `esbuild` bundles.

1. **Phase 1 — tsc**: Compiles all TypeScript to ES5 JavaScript in a single pass into `.build-cache/` (via `tsconfig.build.json`). This is the only phase that does type-checking and ES5 downleveling (esbuild cannot downlevel to ES5).
2. **Phase 2 — esbuild**: Bundles `.build-cache/scripts/**/*.js` into `dist/**/*.oajs`. Resolves path aliases (`@/*`, `@lib/*`), inlines all dependencies, tree-shakes unused code, replaces `process.env.TG_*` with `.env` values, strips `export {}` blocks and module banner comments.

Output requirements: each `.oajs` file is self-contained (no import/export), ES5 syntax, functions at top-level scope. **Functions must be `export`ed to survive tree-shaking.** Directory structure is preserved: `src/scripts/craft/blacksmithing.ts` → `dist/craft/blacksmithing.oajs`.

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

- **Communication language**: Always respond to the user in Russian
- **Code language**: Code comments and UI strings are in Russian
- **Commits**: Conventional format — `type(scope): description` (e.g., `feat(resisting): create`, `fix(blacksmith): update craft items`)
- **Branching**: Feature branches off `master`, merge via pull requests
- **Never edit `dist/`** — it's regenerated on every build
