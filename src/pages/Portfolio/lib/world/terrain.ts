import { BiomeId } from "./biomes";
import { fbm, smoothstep } from "./noise";

export interface TerrainNormal {
  x: number;
  y: number;
  z: number;
}

export interface Terrain {
  seed: number;
  heightAt(x: number, z: number): number;
  biomeAt(x: number, z: number): BiomeId;
  normalAt(x: number, z: number, out: TerrainNormal): void;
}

const HEIGHT_STEP = 0.1;

export const createTerrain = (seed: number): Terrain => {
  const heightAt = (x: number, z: number): number => {
    const distance = Math.sqrt(x * x + z * z);
    const pad = smoothstep(10, 30, distance);

    const rolling = fbm(x * 0.021, z * 0.021, seed, 4) - 0.5;
    const hills = rolling * 5.5 * pad;

    const ridge = fbm(x * 0.0085 + 11.3, z * 0.0085 - 7.1, seed + 91, 3);
    const massif = smoothstep(0.48, 0.9, ridge);
    const peaks = (fbm(x * 0.035, z * 0.035, seed + 17, 3) * 3.5 + 8) * massif;

    const height = hills + peaks * pad;

    return Math.round(height / HEIGHT_STEP) * HEIGHT_STEP;
  };

  const biomeAt = (x: number, z: number): BiomeId => {
    const height = heightAt(x, z);
    const moisture = fbm(x * 0.014 + 5.7, z * 0.014 + 9.3, seed + 53, 3);

    if (height > 7.5) {
      return "mountain";
    }

    if (height > 3) {
      return "rocky";
    }

    if (moisture > 0.57) {
      return "forest";
    }

    return "meadow";
  };

  const normalAt = (x: number, z: number, out: TerrainNormal): void => {
    const delta = 0.7;
    const dx = heightAt(x + delta, z) - heightAt(x - delta, z);
    const dz = heightAt(x, z + delta) - heightAt(x, z - delta);
    const nx = -dx;
    const ny = 2 * delta;
    const nz = -dz;
    const length = Math.sqrt(nx * nx + ny * ny + nz * nz) || 1;

    out.x = nx / length;
    out.y = ny / length;
    out.z = nz / length;
  };

  return { seed, heightAt, biomeAt, normalAt };
};
