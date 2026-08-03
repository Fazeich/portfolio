# Utility Context

## Core Utilities and Libs (`src/lib`)

- **constants.ts** (`src/lib/constants.ts`): All gameplay tuning — arena size, snake speed/boost, turn rate, segment spacing, shell break threshold, shard physics params, HP, food spawn rules.
- **types.ts** (`src/lib/types.ts`): Shared TypeScript types — `GamePhase`, `Vec3`, `InputState`, `FoodEntity`, `Shard`, `BreakInfo`, `SnakeState`, `WorldState`.
- **utils.ts** (`src/lib/utils.ts`): Vector/angle helpers — `clamp`, `lengthXZ`, `normalizeXZ`, `distance3`, `shortestAngle`, `rotateY`.
- **world.ts** (`src/lib/world.ts`): Mutable game world — `createWorld()`, `resetWorld()`, `createInput()`, `spawnFood()`, `nextId()`.
- **physics.ts** (`src/lib/physics.ts`): Hand-rolled physics — `stepWorld()` (movement, steering with `MAX_TURN_RATE`, wall reflection + HP damage, ram detection, shard integration/pickup, food spawning), `isGameOver()`, `segmentRadius()`. Returns a `StepResult` (score gained / damage taken).
- **hooks.ts** (`src/lib/hooks.ts`): React hooks — `useInputRef()` (shared mutable input), `useKeyboardInput()` (WASD/arrows + Space boost), `useIsMobile()`.
- **styles.ts** (`src/lib/styles.ts`): `GlobalStyle` and `PageWrapper` (full-screen layout, dark background).
- **index.css** (`src/index.css`): Global reset + `Exo 2` font import, imported in `src/main.tsx`.
- **theme.ts** (`src/lib/theme.ts`): Mock theme object `GAME_THEME` (arena/snake/food/ui tokens). To be refined later.

## State Management (Stores) (`src/stores`)

- **snake3d** (`src/stores/snake3d`): Effector store for the game UI state.
  - `snake3d.ts`: `$snake3d` store — phase, gameId (increments on every `startGame`, used to trigger world reset), score, hp, boost, best (persisted in localStorage).
  - `events.ts`: `startGame`, `gameOver`, `toMenu`, `pauseGame`, `resumeGame`, `addScore`, `damageSnake`, `setBoost`.
  - `types.ts`: `ISnake3DStore` interface.

## Entry Point

- **main.tsx** (`src/main.tsx`): Bootstraps the app — `ThemeProvider` with `GAME_THEME`, `GlobalStyle`, `<SnakePage />`. No router.
