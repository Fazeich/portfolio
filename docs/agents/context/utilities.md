# Utility Context

## Core Utilities and Libs (`src/lib`)

- **constants.ts** (`src/lib/constants.ts`): All gameplay tuning — arena size, snake speed/boost (max/drain/regen, `BOOST_MIN` start threshold, `BOOST_COOLDOWN`), turn rate, segment spacing, shell break threshold, shard physics params, HP, food spawn rules.
- **types.ts** (`src/lib/types.ts`): Shared TypeScript types — `GamePhase`, `Vec3`, `InputState`, `FoodEntity`, `Shard`, `BreakInfo`, `BreakTracker`, `SnakeState` (incl. `boostCooldown`), `WorldState`.
- **utils.ts** (`src/lib/utils.ts`): Vector/angle helpers — `clamp`, `distance3`, `shortestAngle`.
- **world.ts** (`src/lib/world.ts`): Mutable game world — `createWorld()`, `resetWorld()`, `createInput()`, `spawnFood()`. The snake spawns at the arena center with `START_SEGMENTS` segments.
- **physics.ts** (`src/lib/physics.ts`): Hand-rolled physics — `stepWorld()` (movement, steering with `MAX_TURN_RATE`, wall reflection + HP damage, ram detection, shard integration/pickup, food spawning), `isGameOver()`, `segmentRadius()`. Returns a `StepResult` (score gained / damage taken). Allocation-free hot paths (module-scoped scratch objects, in-place mutation); shared `reflectAxis` helper for wall/floor reflections; shards are tagged with a `breakId` and break bonuses are tracked per-break via `BreakTracker` (handles overlapping breaks). Boost runs on a cooldown: it drains fully to 0 while active, ends when the meter hits 0 (no stutter), starts a `BOOST_COOLDOWN` on end, and regenerates only after the cooldown expires. `BOOST_MIN` only gates starting a *new* boost — an active boost drains all the way down.
- **hooks.ts** (`src/lib/hooks.ts`): React hooks — `useInputRef()` (shared mutable input), `useKeyboardInput()` (WASD/arrows + Space boost).
- **styles.ts** (`src/lib/styles.ts`): `GlobalStyle` and `PageWrapper` (full-screen layout, dark background).
- **index.css** (`src/index.css`): Global reset + `Exo 2` font import, imported in `src/main.tsx`.
- **theme.ts** (`src/lib/theme.ts`): Mock theme object `GAME_THEME` (arena/snake/food/ui tokens). To be refined later.
- **assets/fonts** (`src/lib/assets/fonts/`): Shared `helvetiker_bold.typeface.json` (drei `Text3D` billboard text on altars; `FontLoader`/`TextGeometry` glyph cache for Letter Rain).

## State Management (Stores) (`src/stores`)

- **snake3d** (`src/stores/snake3d`): Effector store for the game UI state.
  - `snake3d.ts`: `$snake3d` store — phase, gameId (increments on every `startGame`, used to trigger world reset), score, hp, best (persisted in localStorage).
  - `events.ts`: `startGame`, `gameOver`, `toMenu`, `pauseGame`, `resumeGame`, `addScore`, `damageSnake`.
  - `types.ts`: `ISnake3DStore` interface.
- **letters** (`src/stores/letters`): Effector events feeding the Letter Rain world (which lives in a page ref).
  - `events.ts`: `letterTyped(char)`, `clearLetters`.

## Page-Specific Libs

- **Letter Rain world/lib** (`src/pages/Letters/lib`): Used only by the Letters page.
  - `constants.ts`: Layout/physics tuning — `MAX_LETTERS` (9), `MIN_LETTER_PX` (120 — minimum on-screen letter size in px), play-area bounds (`AREA_HALF_W`, `AREA_HEIGHT`; `AREA_HALF_D` = 0.9 ≈ 1.5 × letter depth — the field is one row deep), fast fall tuning (`GRAVITY` 90, `INITIAL_VY` -10, `MAX_FALL_SPEED` 60), free tilt dynamics (`MAX_TILT` 0.3 rad with limit bounce, `TILT_VELOCITY` 2, `TILT_AIR_DRAG`, `TILT_REST_DRAG`, `TILT_IMPACT_KICK`), camera FOV/margin, visual tokens (background/letter/floor/wall colors).
  - `types.ts`: `LetterEntity` (id, char, position/velocity vectors, tilt + tilt velocities, per-char base AABB half-extents, resting flag), `LettersWorld` (letters array, nextId, `pxPerWorld`, `letterScale`).
  - `geometry.ts`: Font + glyph geometry cache — parses the shared `helvetiker_bold.typeface.json` once (`FontLoader`), builds a centered `TextGeometry` per unique character (cached), and exposes each char's bounding box (clamped to a 0.05 min) for collision.
  - `world.ts`: `createLettersWorld()`, `spawnLetter(world, char)` (pushes ONE letter above the top boundary at z = 0, evicts the oldest past `MAX_LETTERS`), `clearWorldLetters(world)`, `getLetterScale(world, letter)` (uniform scale so both glyph dimensions reach `world.letterScale`, which the camera rig derives from `MIN_LETTER_PX`).
  - `physics.ts`: Hand-rolled AABB simulation — `stepLetters(world, dt)`: gravity + integration, side/bottom wall clamps (no top clamp), single-row depth (every letter is locked at z = 0 — no depth stacking), pairwise overlap resolution in X/Y only (vertical case zeroes both y-velocities so landing letters stop), a final clamp pass so no letter can ever end a frame below the floor, support detection + resting state, tilt damping on contact. **Tilt is free/dynamic**: integrated every frame via `stepTilt` (air drag while falling, gentler friction at rest), bounces off the ±`MAX_TILT` limits instead of being forced flat, and hard landings / pile impacts add random angular kicks (`TILT_IMPACT_KICK`) so letters keep their landed angle and rock on impact — ready for drag & drop later. Allocation-free hot path (mutates entities in place).
  - `physics.test.ts`: Vitest suite — gravity, floor settling, no top clamp, side clamps, single-row depth lock, letter-letter separation, spawn above top, cap eviction, no sinking below the floor while stacking, **landed tilt is preserved (not reset to flat)**, scale guarantees both dimensions ≥ `letterScale`.

## Entry Point

- **main.tsx** (`src/main.tsx`): Bootstraps the app — `ThemeProvider` with `GAME_THEME`, `GlobalStyle`, `<SnakePage />`. No router.

## Tests

- **Vitest** (`vitest.config.ts`): Unit tests for pure game logic run with `npm test` (`vitest run`).
  - `src/lib/utils.test.ts` — vector/angle helpers.
  - `src/lib/physics.test.ts` — `stepWorld`, `segmentRadius`, `isGameOver`, wall damage, boost ram / shell break tracking, boost cooldown and 0% hard stop.
  - `src/stores/snake3d/snake3d.test.ts` — store reducers and best-score persistence (localStorage stub).
