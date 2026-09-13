import { createRng } from "@/lib/random";
import { CHUNK_SIZE } from "../constants";
import { Terrain } from "./terrain";
import { createPedestalForChunk, createStartPedestals } from "./pedestals";

export const RAMP_SIZES = [
  { height: 0.8, length: 5, width: 3.2 },
  { height: 1.6, length: 7, width: 3.6 },
  { height: 2.4, length: 8, width: 4 },
] as const;
export interface Ramp {
  x: number; y: number; z: number; heading: number; variant: number;
  height: number; length: number; width: number;
}
export const createRampForChunk = (terrain: Terrain, seed: number, cx: number, cz: number): Ramp | null => {
  const rng = createRng((seed * 271 + cx * 198491317 + cz * 6542989) >>> 0);
  if (rng() > 0.13 || (Math.abs(cx) < 2 && Math.abs(cz) < 2)) return null;
  const variant = Math.floor(rng() * RAMP_SIZES.length);
  const x = (cx + 0.5) * CHUNK_SIZE, z = (cz + 0.5) * CHUNK_SIZE;
  const heading = Math.floor(rng() * 4) * Math.PI / 2;
  const size = RAMP_SIZES[variant];
  const y = terrain.heightAt(x - Math.sin(heading) * size.length / 2, z - Math.cos(heading) * size.length / 2);
  for (const dx of [-5, 0, 5]) for (const dz of [-5, 0, 5]) {
    if (Math.abs(terrain.heightAt(x + dx, z + dz) - y) > 0.35) return null;
  }
  const pedestals = createStartPedestals();
  for (let ix = cx - 1; ix <= cx + 1; ix += 1) for (let iz = cz - 1; iz <= cz + 1; iz += 1) {
    const pedestal = createPedestalForChunk(seed, ix, iz);
    if (pedestal) pedestals.push(pedestal);
  }
  if (pedestals.some((p) => Math.hypot(p.position.x - x, p.position.z - z) < 11)) return null;
  return { x, y, z, heading, variant, ...size };
};
export const rampCoordinates = (ramp: Ramp, x: number, z: number) => ({
  forward: (x - ramp.x) * Math.sin(ramp.heading) + (z - ramp.z) * Math.cos(ramp.heading),
  side: (x - ramp.x) * Math.cos(ramp.heading) - (z - ramp.z) * Math.sin(ramp.heading),
});
export const rampHeightAt = (ramp: Ramp, x: number, z: number): number | null => {
  const { forward, side } = rampCoordinates(ramp, x, z);
  if (Math.abs(side) > ramp.width / 2 || Math.abs(forward) > ramp.length / 2) return null;
  const t = (forward + ramp.length / 2) / ramp.length;
  return ramp.y + ramp.height * t * t;
};
export const inRampLane = (ramp: Ramp, x: number, z: number): boolean => {
  const { forward, side } = rampCoordinates(ramp, x, z);
  return Math.abs(side) < ramp.width / 2 + 1.8 && forward > -ramp.length / 2 - 4 && forward < ramp.length / 2 + 9;
};

export const createDrivingSurface = (terrain: Terrain, ramps: () => Ramp[]) => ({
  heightAt: (x: number, z: number): number => {
    let height = terrain.heightAt(x, z);
    for (const ramp of ramps()) {
      const top = rampHeightAt(ramp, x, z);
      if (top !== null) height = Math.max(height, top);
    }
    return height;
  },
  normalAt: (x: number, z: number, out: { x: number; y: number; z: number }): void => {
    const ramp = ramps().find((r) => {
      const height = rampHeightAt(r, x, z);
      return height !== null && height >= terrain.heightAt(x, z);
    });
    if (!ramp) { terrain.normalAt(x, z, out); return; }
    const t = (rampCoordinates(ramp, x, z).forward + ramp.length / 2) / ramp.length;
    const grade = 2 * ramp.height * t / ramp.length;
    const length = Math.hypot(1, grade);
    out.x = -Math.sin(ramp.heading) * grade / length;
    out.y = 1 / length;
    out.z = -Math.cos(ramp.heading) * grade / length;
  },
});
