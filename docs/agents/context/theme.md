# Theme Context

## Theme Implementation

The theme is currently a **mock** and will be refined later. It is provided via `styled-components` `ThemeProvider` and typed through the `DefaultTheme` module augmentation.

- **theme.ts** (`src/lib/theme.ts`): Main theme definition — the exported `GAME_THEME` object with sections:
  - `arena`: background color, wall color/opacity, grid colors.
  - `snake`: head/body/tail gradient colors + glow color.
  - `food`: shell, core, shard colors.
  - `ui`: text, muted text, accent, danger, boost, panel/panel-border, overlay colors (used by HUD and Screens).
  - `town`: bright-hub DOM tokens — title/hint text colors, key-cap colors, white fade color (used by `HubHud` and the activation fade overlay).
- **theme.d.ts** (`src/declarations/theme.d.ts`): TypeScript declaration extending `styled-components` `DefaultTheme` with the `ITheme` interface so `useTheme()` is typed.

## Styling Approach

- `styled-components` is used for DOM overlays (HUD, screens, global styles). Three.js materials read theme tokens via `useTheme()`.
- Global styles live in `src/lib/styles.ts` (`GlobalStyle`, `PageWrapper`) and `src/index.css` (font import `Exo 2`, base reset, imported in `src/main.tsx`).

- **Expedition overlay styling** (`src/pages/Portfolio/ui/HubHud.tsx`): Local styled-components use deep teal panels, warm ivory type, amber actions and mint progress; responsive atlas and footer with visible keyboard focus.

- **Configurable HUD transparency** (`src/pages/Portfolio/ui/HubHud.tsx`): Global --hud-opacity CSS variable controls panel/map/pause backgrounds without dimming text. Defaults to 45% transparency, adjustable 0–85%, stored in localStorage; circular atlas grid, lightweight teal glass and mint/gold accents.
