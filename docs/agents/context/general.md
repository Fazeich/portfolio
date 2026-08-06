# General Context

## Project Overview
This project is a personal portfolio built as a set of **3D mini-games**. The games are the portfolio — they showcase skills through the quality of the gameplay and the codebase, without an explicit "skills" section. Built with React, Vite, Three.js (react-three-fiber), and Effector for state management.

## Core Technologies
- **Framework**: React 18
- **Build Tool**: Vite
- **State Management**: Effector (discrete game events only)
- **3D Rendering**: `three` + `@react-three/fiber` (Canvas, useFrame), `@react-three/drei` (Grid, Edges, Text3D, Billboard), `@react-three/postprocessing` (Bloom). All pages (town, snake, letters) are 3D.
- **Styling**: `styled-components` for HUD/DOM overlays + a mock theme system (to be refined later)
- **Routing**: `react-router-dom` (BrowserRouter, basename `/portfolio`)
- **Icons**: `react-social-icons` (menu links, decorative icons)

## Routes
- `/` — 3D top-down town mini-game. Walk a low-poly character to a 3D billboard sign, press E to enter a project. The altar system is data-driven via `ALTARS` in `src/pages/Portfolio/lib/constants.ts` (currently "Snake 3D" → `/snake` and "Letter Rain" → `/letters`).
- `/snake` — 3D Snake game.
- `/letters` — Letter Rain: typed characters fall as 3D letters with simple physics.
- GitHub Pages SPA fallback via `dist/404.html` copy of `index.html`
- **Other**: `gh-pages` (deploy)

## Architecture
The project follows a modular structure based on Feature-Sliced Design (FSD) principles. **Strict adherence to the current folder structure and hierarchy is mandatory.**

- `src/components`: Game components (Arena, Snake, Food, Shards, CameraRig, Effects, Hud, Screens).
- `src/pages`: Page-level components that compose components (Portfolio/town, Snake, Letters).
- `src/stores`: Effector stores for application state management.
- `src/lib`: Core utilities, constants, physics, world state, hooks, theme, global styles, types, shared assets (fonts).
- `src/declarations`: TypeScript type declarations.
- `src/main.tsx`: Entry point — `ThemeProvider(GAME_THEME)` → router with `<PortfolioPage />`, `<SnakePage />`, `<LettersPage />`.

## Component Pattern
To maintain consistency, every component follows this structure:
- `[component_name]/`
    - `index.ts`: Re-exports the component from the `ui` directory.
    - `ui/`: Contains the main component markup and logic.
    - `lib/`: Contains component-specific files (e.g., `[component_name].styles.ts`, `constants.ts`, `utils.ts`).

**Rules for `lib/` directory:**
- Files are placed in the component's `lib` folder ONLY if they are used exclusively by that component.
- If a file in `lib` is imported by other components, it must be moved to a `lib` folder at the highest common level shared by those components (usually `src/lib`).

## Game Architecture (key decisions)
- **Mutable world state** (`src/lib/world.ts` for snake; `src/pages/Letters/lib/world.ts` for letters) is the single source of truth for gameplay and lives in refs — no React re-renders per frame.
- **Physics** is hand-rolled (no physics engine): follow-the-leader chain, plane reflections, ram detection, shard physics; letters use AABB gravity/stacking physics.
- **Effector** handles only discrete UI events: phase, score, HP, best score (localStorage); `letterTyped`/`clearLetters` feed the letters world.
- **Game loop** runs inside the Canvas via `useFrame` (`src/pages/Snake/ui/GameLoop.tsx`; letters loop in `LettersScene`); input raycast for mouse lives in `PointerTracker.tsx`.
