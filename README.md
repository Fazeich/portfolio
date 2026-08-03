# Snake 3D — Portfolio Game

A personal portfolio built as a **3D Snake game** with a unique mechanic: the snake moves freely at any angle across a volumetric arena, and to get food you have to **break its protective shell with a boost ram** and collect the flying shards.

The game itself is the portfolio — it demonstrates skills through the gameplay and the quality of the code, without an explicit "skills" section.

## Gameplay Mechanics

- **Free movement at any angle** — the snake is not bound to a grid; turns are smooth.
- **Limited turn rate** — steering requires precision; turning is not instantaneous.
- **Protected food** — food has a shell:
  - a weak touch bounces the food away from the snake;
  - a **boost ram** (speed above the threshold) breaks the shell.
- **Shards** — broken food bursts into **1–3 shards** that bounce off walls and the floor; collect them for score and snake growth.
- **Break bonus** — eating all the shards from a single break grants a bonus.
- **Wall damage** — hitting a wall with the head costs **1 HP** (3 in total) and reflects the direction along the wall normal.
- **Boost** — the boost meter drains while accelerating and slowly regenerates.
- **Best score** — persisted in `localStorage`.
- **Food respawn** — eaten or broken food is replaced after a short delay, up to 3 items in the arena at once.

## Controls

| Action | Control |
|---|---|
| Movement | **Mouse** (hold **LMB**, the snake steers away from the cursor) or **WASD** / arrow keys |
| Boost | **Space** (hold) |
| Pause | **Esc** |
| Start / restart | **Space** or **Enter** (in the menu / on the game-over screen) |

## Game States

`menu → playing → paused → gameover`

- **Menu**: title, rules, "Play" button, social links.
- **Playing**: HUD with score, HP hearts, and the boost bar.
- **Paused**: resume or restart.
- **Game over**: final score, best score, "Play again" / "To menu".

## Tech Stack

- **React 18** + **Vite 6** + **TypeScript**
- **Three.js** with **react-three-fiber** (Canvas, useFrame), **drei** (Grid, Edges), **@react-three/postprocessing** (Bloom)
- **Effector** — state management for discrete game events
- **styled-components** — HUD and screen styling, theming
- **react-social-icons** — social icons in the menu
- **ESLint** (typescript-eslint, flat config) + **tsc** for type checking (strict mode)
- **Vitest** — unit tests for physics, utils, and the Effector store

## Project Structure

```
src/
  main.tsx                      # entry point: ThemeProvider(GAME_THEME) → SnakePage
  components/                   # game components (each with lib/ and ui/)
    Arena/                      # 3D arena: grid floor, walls with neon edges
    Snake/                      # snake: InstancedMesh pool (head + chain)
    Food/                       # protected food (shell + core)
    Shards/                     # shards (octahedron pool, edible/inert)
    CameraRig/                  # camera: follow, FOV kick, orbit in menu
    Effects/                    # break particles + ambient dust
    Hud/                        # DOM overlay: score, HP, boost
    Screens/                    # menu / pause / game-over screens
  pages/
    Snake/                      # the only page: Canvas composition
      ui/GameLoop.tsx           # game loop (useFrame), Effector sync
      ui/PointerTracker.tsx     # mouse raycast onto the arena floor (LMB)
  lib/                          # shared code (imported by 2+ components)
    constants.ts                # all gameplay tuning parameters
    types.ts                    # shared types (WorldState, InputState, ...)
    utils.ts                    # vector/angle helpers
    world.ts                    # mutable world state (createWorld, resetWorld)
    physics.ts                  # physics: movement, ram, shards, reflections
    hooks.ts                    # useInputRef, useKeyboardInput
    theme.ts                    # mock theme (arena/snake/food/UI tokens)
    styles.ts                   # GlobalStyle, PageWrapper
  stores/
    snake3d/                    # Effector store for game UI state
  declarations/
    theme.d.ts                  # styled-components DefaultTheme typing
```

### Key Architecture Decisions

- **Mutable world** (`src/lib/world.ts`) — the single source of truth for gameplay, lives in refs, no React re-renders per frame.
- **Hand-rolled physics** (`src/lib/physics.ts`) — no physics engine: follow-the-leader chain, plane reflections, ram threshold, shard physics.
- **Effector** — only discrete events: phase, score, HP, boost, best score.
- **Game loop** — inside the Canvas via `useFrame` (`GameLoop.tsx`).

## Getting Started

```bash
npm install        # install dependencies
npm run start      # dev server (http://localhost:3000/portfolio/)
```

## Scripts

| Command | Description |
|---|---|
| `npm run start` | Start the dev server |
| `npm run build` | Build the production bundle |
| `npm run lint` | Run ESLint with auto-fix |
| `npm run typecheck` | TypeScript type checking |
| `npm test` | Run unit tests (Vitest) |
| `npm run deploy` | Deploy to GitHub Pages |

## Links

- [Telegram](https://t.me/samsyaaa)
- [GitHub](https://github.com/fazeich)
- Email: vladislavchenko@inbox.ru
