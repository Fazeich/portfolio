# Utility Context

## Core Utilities and Libs (`src/lib`)

- **constants.ts** (`src/lib/constants.ts`): All gameplay tuning — arena size, snake speed/boost, turn rate, segment spacing, shell break threshold, shard physics params, HP, food spawn rules.
- **types.ts** (`src/lib/types.ts`): Shared TypeScript types — `GamePhase`, `Vec3`, `InputState`, `FoodEntity`, `Shard`, `BreakInfo`, `BreakTracker`, `SnakeState`, `WorldState`.
- **utils.ts** (`src/lib/utils.ts`): Vector/angle helpers — `clamp`, `distance3`, `shortestAngle`.
- **world.ts** (`src/lib/world.ts`): Mutable game world — `createWorld()`, `resetWorld()`, `createInput()`, `spawnFood()`.
- **physics.ts** (`src/lib/physics.ts`): Hand-rolled physics — `stepWorld()` (movement, steering with `MAX_TURN_RATE`, wall reflection + HP damage, ram detection, shard integration/pickup, food spawning), `isGameOver()`, `segmentRadius()`. Returns a `StepResult` (score gained / damage taken). Allocation-free hot paths (module-scoped scratch objects, in-place mutation); shared `reflectAxis` helper for wall/floor reflections; shards are tagged with a `breakId` and break bonuses are tracked per-break via `BreakTracker` (handles overlapping breaks).
- **hooks.ts** (`src/lib/hooks.ts`): React hooks — `useInputRef()` (shared mutable input), `useKeyboardInput()` (WASD/arrows + Space boost).
- **styles.ts** (`src/lib/styles.ts`): `GlobalStyle` and `PageWrapper` (full-screen layout, dark background).
- **index.css** (`src/index.css`): Global reset + `Exo 2` font import, imported in `src/main.tsx`.
- **theme.ts** (`src/lib/theme.ts`): Mock theme object `GAME_THEME` (arena/snake/food/ui tokens). To be refined later.

## State Management (Stores) (`src/stores`)

- **snake3d** (`src/stores/snake3d`): Effector store for the game UI state.
  - `snake3d.ts`: `$snake3d` store — phase, gameId (increments on every `startGame`, used to trigger world reset), score, hp, best (persisted in localStorage).
  - `events.ts`: `startGame`, `gameOver`, `toMenu`, `pauseGame`, `resumeGame`, `addScore`, `damageSnake`.
  - `types.ts`: `ISnake3DStore` interface.

## Entry Point

- **main.tsx** (`src/main.tsx`): Bootstraps the app — `ThemeProvider` with `GAME_THEME`, `GlobalStyle`, `<SnakePage />`. No router.

## Tests

- **Vitest** (`vitest.config.ts`): Unit tests for pure game logic run with `npm test` (`vitest run`).
  - `src/lib/utils.test.ts` — vector/angle helpers.
  - `src/lib/physics.test.ts` — `stepWorld`, `segmentRadius`, `isGameOver`, wall damage, boost ram / shell break tracking.
  - `src/stores/snake3d/snake3d.test.ts` — store reducers and best-score persistence (localStorage stub).
