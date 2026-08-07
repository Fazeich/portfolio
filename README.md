# Portfolio — 3D Mini-Games

A personal portfolio built as a set of **3D mini-games** with react-three-fiber. The games are the portfolio — they demonstrate skills through gameplay and code quality, without an explicit "skills" section.

## Pages

- **Town** (`/`) — a bright 3D diorama hub. Move a voxel character (switch between a **mage** and a **car** with `1`) to a billboard sign and press `E` to enter a game.
- **Snake 3D** (`/snake`) — free-movement snake in a volumetric arena: break protected food with a boost ram and collect flying shards.
- **Letter Rain** (`/letters`) — type anywhere; characters fall as 3D blocks with simple stacking physics.

## Controls

| Page | Control |
|---|---|
| Town | `WASD` / arrows to move, `1` to switch character, `E` to enter a game, `Esc` back |
| Snake | Mouse (`LMB`) or `WASD` to steer, `Space` boost, `Esc` pause |
| Letter Rain | Type to drop letters, `Esc` or `← Назад` to return |

## Tech Stack

- **React 18** + **Vite** + **TypeScript** (strict)
- **Three.js** + **react-three-fiber**, **drei**, **@react-three/postprocessing** (Bloom, Vignette)
- **Effector** — discrete game events
- **styled-components** — DOM overlays and theming
- **Vitest** — unit tests for physics and stores
- **ESLint** (flat config) + `tsc`

## Getting Started

```bash
npm install
npm run start      # dev server → http://localhost:3000/portfolio/
```

Scripts: `npm run build`, `npm run lint`, `npm run typecheck`, `npm test`, `npm run deploy` (GitHub Pages).

## Links

- [Telegram](https://t.me/samsyaaa)
- [GitHub](https://github.com/fazeich)
- Email: vladislavchenko@inbox.ru
