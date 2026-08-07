import {
  ALTARS,
  HALF_D,
  HALF_W,
  LANTERN_POLE_HALF,
  LANTERN_POSITIONS,
  PLAYER_MARGIN,
} from "./constants";

interface Obstacle {
  x: number;
  z: number;
  halfW: number;
  halfD: number;
}

const OBSTACLES: Obstacle[] = (() => {
  const list: Obstacle[] = [];

  for (const altar of ALTARS) {
    list.push({
      x: altar.position.x,
      z: altar.position.z,
      halfW: altar.halfW,
      halfD: altar.halfD,
    });
  }

  for (const lantern of LANTERN_POSITIONS) {
    list.push({
      x: lantern.x,
      z: lantern.z,
      halfW: LANTERN_POLE_HALF,
      halfD: LANTERN_POLE_HALF,
    });
  }

  return list;
})();

export interface RoomPos {
  x: number;
  z: number;
}

export const clampToRoom = (pos: RoomPos): void => {
  pos.x = Math.max(-HALF_W + PLAYER_MARGIN, Math.min(HALF_W - PLAYER_MARGIN, pos.x));
  pos.z = Math.max(-HALF_D + PLAYER_MARGIN, Math.min(HALF_D - PLAYER_MARGIN, pos.z));
};

export const resolveObstacles = (pos: RoomPos, radius: number): boolean => {
  let hit = false;

  for (const obstacle of OBSTACLES) {
    const minX = obstacle.x - obstacle.halfW;
    const maxX = obstacle.x + obstacle.halfW;
    const minZ = obstacle.z - obstacle.halfD;
    const maxZ = obstacle.z + obstacle.halfD;

    const cx = Math.max(minX, Math.min(maxX, pos.x));
    const cz = Math.max(minZ, Math.min(maxZ, pos.z));

    const dx = pos.x - cx;
    const dz = pos.z - cz;
    const distSq = dx * dx + dz * dz;

    if (distSq >= radius * radius) {
      continue;
    }

    hit = true;

    if (distSq > 0.0001) {
      const dist = Math.sqrt(distSq);
      pos.x += (dx / dist) * (radius - dist);
      pos.z += (dz / dist) * (radius - dist);

      continue;
    }

    const left = pos.x - minX;
    const right = maxX - pos.x;
    const top = pos.z - minZ;
    const bottom = maxZ - pos.z;
    const nearest = Math.min(left, right, top, bottom);

    if (nearest === left) {
      pos.x = minX - radius;
    } else if (nearest === right) {
      pos.x = maxX + radius;
    } else if (nearest === top) {
      pos.z = minZ - radius;
    } else {
      pos.z = maxZ + radius;
    }
  }

  return hit;
};
