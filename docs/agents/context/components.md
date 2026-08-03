# Component Context

## Page (`src/pages`)

- **SnakePage** (`src/pages/Snake`): The only page. Composes the 3D `<Canvas>` (Arena, Snake, Food, Shards, Effects, CameraRig, lights, Bloom) with DOM overlays (Hud, Screens).
  - `ui/GameLoop.tsx`: Orchestrates the game loop inside Canvas — resets the world when the store's `gameId` changes (new game only, not on resume), steps physics, dispatches score/HP/boost events.
  - `ui/PointerTracker.tsx`: Raycasts the mouse pointer onto the arena floor plane and writes the target point into `inputRef` for steering. Mouse steering is active **only while the left mouse button is held** and is **inverted** (the snake steers away from the cursor); releasing LMB stops steering (WASD keeps working).

## Feature Components (`src/components`)

- **Arena** (`src/components/Arena`): Renders the 3D arena — neon-grid floor (drei `Grid`) and 4 semi-transparent walls with glowing edges.
  - `lib/constants.ts`: Wall thickness.
- **Snake** (`src/components/Snake`): Renders the snake as an `InstancedMesh` pool (head + chain), synced from world state each frame. Per-segment colors (head→tail gradient) and orientation.
  - `lib/render.ts`: Per-frame matrix/color sync for the instanced chain.
- **Food** (`src/components/Food`): Renders "protected" food — translucent shell sphere with a glowing core. Pool of `MAX_FOODS` slots synced from world state.
- **Shards** (`src/components/Shards`): Renders shard pickups as a single `InstancedMesh` octahedron pool (1 draw call). Per-instance colors distinguish edible (amber, from theme) from inert just-broken (gray).
- **CameraRig** (`src/components/CameraRig`): Follow camera behind the head with smoothing, FOV kick on boost, orbit mode on the menu screen.
  - `lib/constants.ts`: Camera offsets, FOV values, orbit params.
- **Effects** (`src/components/Effects`): Ambient dust points + a particle burst pool triggered on shell breaks.
  - `lib/particles.ts`: CPU particle simulation (positions/colors/lifetimes, circle sprite texture).
  - `lib/constants.ts`: Particle counts, speed, lifetime.
- **Hud** (`src/components/Hud`): DOM overlay — score, best score, HP hearts, boost bar. The boost bar is ref-driven (updated in a `requestAnimationFrame` loop straight from the mutable world, no React re-renders).
  - `lib/styles.ts`: styled-components for the HUD.
- **Screens** (`src/components/Screens`): DOM overlays for `menu` / `paused` / `gameover` phases — title, rules, controls, play buttons, social links (react-social-icons). Handles Esc-pause and Space/Enter-start hotkeys.
  - `lib/styles.ts`: styled-components for screens/panels/buttons.
