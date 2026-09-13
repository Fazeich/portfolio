import { world } from "./world";

export interface WorldPos {
  x: number;
  z: number;
}

export const resolveObstacles = (pos: WorldPos, radius: number): boolean => {
  let hit = false;

  for (const collider of world.colliders) {
    const dx = pos.x - collider.x;
    const dz = pos.z - collider.z;
    const minDistance = collider.radius + radius;
    const distSq = dx * dx + dz * dz;

    if (distSq >= minDistance * minDistance) {
      continue;
    }

    hit = true;

    if (distSq > 1e-6) {
      const distance = Math.sqrt(distSq);

      pos.x += (dx / distance) * (minDistance - distance);
      pos.z += (dz / distance) * (minDistance - distance);
    } else {
      pos.x += minDistance;
    }
  }

  return hit;
};
