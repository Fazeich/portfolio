# Art Direction — Voxel Open World

Target for the map loop: **every map element scores >= 8/10** on the rubric below,
verified by a vision-model judge on fixed-seed screenshots.

## Style

- Voxel / low-poly diorama, bright and readable, consistent with the procedural
  car (`src/pages/Portfolio/lib/CarModel.tsx`).
- No external assets: no GLTF, no texture files. All geometry and materials are
  generated procedurally in code.

## Allowed concept changes (Phase 1)

- Infinite procedural voxel terrain with chunk streaming and explicit biomes.
- Removal of the perimeter fence (`lib/Walls.tsx`) in favor of an open world.
- Random pedestals (existing mini-games `Snake 3D`, `Letter Rain`) placed by a
  seeded RNG.

## Element inventory

`terrain-surface`, `terrain-detail`, `rocks-cliffs`, `trees-vegetation`,
`biome-transitions`, `distant-horizon`, `pedestals`, `props`.

## Rubric (0-10 each, threshold 8)

- `silhouette` — form readability and contrast against the background.
- `material` — variety and plausibility of materials; no plastic look.
- `texture-detail` — surface detail; no large flat untextured faces.
- `lighting-response` — how the element reacts to light and shadow.
- `biome-consistency` — coherence with the biome and neighboring elements.
- `performance` — element does not break the draw-call / triangle budget.

## Performance budget

60 FPS target / 45 FPS minimum, <= 300 draw calls, <= 150k triangles,
<= 40 active chunks, <= 200 physics bodies.

## Deferred (on-demand phase)

Water and atmosphere are **not** part of Phase 1. They become a separate phase
invoked only after the final Phase-1 result is reviewed.
