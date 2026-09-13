import { readAutoloopSeed } from "@/lib/autoloop";
import { TERRAIN_SEED } from "../constants";
import { buildColliders, generateChunk } from "./generate";
import {
  createPedestalForChunk,
  createStartPedestals,
} from "./pedestals";
import { createTerrain } from "./terrain";
import { rampHeightAt, createDrivingSurface } from "./ramps";
import { World } from "./types";
import { disposeChunkGeometry, getChunkGeometry } from "./geometry";
import {
  CHUNK_SIZE,
  STREAM_WINDOW_COLS,
  STREAM_WINDOW_ROWS,
} from "../constants";

const seed = readAutoloopSeed() || TERRAIN_SEED;
const terrain = createTerrain(seed);
const startPedestals = createStartPedestals();
const chunkCache = new Map<string, ReturnType<typeof generateChunk>>();
const wildPedestalCache = new Map<string, ReturnType<typeof createPedestalForChunk>>();
const listeners = new Set<() => void>();
let revision = 0;
let activeCenter = { cx: 0, cz: 0 };
let plannedCenter = { cx: NaN, cz: NaN };
let pending: Array<{ cx: number; cz: number }> = [];
export const CHUNK_CACHE_LIMIT = 144;
let generatedLastUpdate = 0;

const keyOf = (cx: number, cz: number): string => `${cx}:${cz}`;

const activeBounds = (cx: number, cz: number) => ({
  minX: cx - Math.floor(STREAM_WINDOW_COLS / 2),
  maxX: cx + Math.ceil(STREAM_WINDOW_COLS / 2) - 1,
  minZ: cz - Math.floor(STREAM_WINDOW_ROWS / 2),
  maxZ: cz + Math.ceil(STREAM_WINDOW_ROWS / 2) - 1,
});

const chunkPosition = (value: number): number =>
  Math.floor(value / CHUNK_SIZE);

const ensureChunk = (cx: number, cz: number): void => {
  const key = keyOf(cx, cz);

  if (chunkCache.has(key)) {
    return;
  }

  const wild = createPedestalForChunk(seed, cx, cz);
  const pedestals = wild ? [...startPedestals, wild] : startPedestals;

  wildPedestalCache.set(key, wild);
  const chunk = generateChunk(terrain, seed, cx, cz, pedestals);
  getChunkGeometry(chunk, terrain);
  chunkCache.set(key, chunk);
};

const rebuildActiveWorld = (cx: number, cz: number): void => {
  const bounds = activeBounds(cx, cz);

  for (let z = bounds.minZ; z <= bounds.maxZ; z += 1) {
    for (let x = bounds.minX; x <= bounds.maxX; x += 1) {
      ensureChunk(x, z);
    }
  }

  const chunks = [];
  const wildPedestals = [];

  for (let z = bounds.minZ; z <= bounds.maxZ; z += 1) {
    for (let x = bounds.minX; x <= bounds.maxX; x += 1) {
      const key = keyOf(x, z);
      const chunk = chunkCache.get(key);
      const wild = wildPedestalCache.get(key);

      if (chunk) {
        chunks.push(chunk);
      }

      if (wild) {
        wildPedestals.push(wild);
      }
    }
  }

  const activePedestals = [
    ...startPedestals.filter((pedestal) => {
      const cx = chunkPosition(pedestal.position.x);
      const cz = chunkPosition(pedestal.position.z);

      return (
        cx >= bounds.minX &&
        cx <= bounds.maxX &&
        cz >= bounds.minZ &&
        cz <= bounds.maxZ
      );
    }),
    ...wildPedestals,
  ];
  const props = chunks.flatMap((chunk) => chunk.props);

  world.chunks = chunks;
  world.props = props;
  world.ramps = chunks.flatMap((chunk) => chunk.ramps);
  world.pedestals = activePedestals;
  world.colliders = buildColliders(props, activePedestals);
};

export const world: World = {
  seed,
  terrain,
  chunks: [],
  props: [],
  ramps: [],
  pedestals: startPedestals,
  colliders: [],
};

rebuildActiveWorld(0, 0);

/** Prepare at most one chunk (including terrain geometry) per render frame. */
export const updateWorldStreaming = (x: number, z: number): boolean => {
  if (!Number.isFinite(x) || !Number.isFinite(z)) return false;
  const cx = chunkPosition(x);
  const cz = chunkPosition(z);
  generatedLastUpdate = 0;

  if (cx !== plannedCenter.cx || cz !== plannedCenter.cz) {
    plannedCenter = { cx, cz };
    const bounds = activeBounds(cx, cz);
    pending = [];
    // Active window first, then a one-chunk prefetch ring in every direction.
    for (let ring = 0; ring <= 1; ring += 1) {
      for (let iz = bounds.minZ - ring; iz <= bounds.maxZ + ring; iz += 1) {
        for (let ix = bounds.minX - ring; ix <= bounds.maxX + ring; ix += 1) {
          if (ring && ix >= bounds.minX && ix <= bounds.maxX && iz >= bounds.minZ && iz <= bounds.maxZ) continue;
          if (!chunkCache.has(keyOf(ix, iz))) pending.push({ cx: ix, cz: iz });
        }
      }
    }
  }

  const next = pending.shift();
  if (next) {
    ensureChunk(next.cx, next.cz);
    generatedLastUpdate = 1;
  }

  let changed = false;
  if (cx !== activeCenter.cx || cz !== activeCenter.cz) {
    const bounds = activeBounds(cx, cz);
    let ready = true;
    for (let iz = bounds.minZ; iz <= bounds.maxZ && ready; iz += 1) {
      for (let ix = bounds.minX; ix <= bounds.maxX; ix += 1) {
        if (!chunkCache.has(keyOf(ix, iz))) { ready = false; break; }
      }
    }
    if (ready) {
      rebuildActiveWorld(cx, cz);
      activeCenter = { cx, cz };
      revision += 1;
      listeners.forEach((listener) => listener());
      changed = true;
    }
  }

  // Bounded cache prevents a long drive from accumulating geometry indefinitely.
  if (chunkCache.size > CHUNK_CACHE_LIMIT) {
    const active = new Set(world.chunks);
    const victims = Array.from(chunkCache.entries())
      .filter(([, chunk]) => !active.has(chunk) &&
        (Math.abs(chunk.cx - cx) > STREAM_WINDOW_COLS / 2 + 1 ||
         Math.abs(chunk.cz - cz) > STREAM_WINDOW_ROWS / 2 + 1))
      .sort((a, b) => (Math.abs(b[1].cx - cx) + Math.abs(b[1].cz - cz)) -
        (Math.abs(a[1].cx - cx) + Math.abs(a[1].cz - cz)));
    for (const [key, chunk] of victims) {
      if (chunkCache.size <= CHUNK_CACHE_LIMIT) break;
      disposeChunkGeometry(chunk);
      chunkCache.delete(key);
      wildPedestalCache.delete(key);
    }
  }
  return changed;
};

export const getStreamingStats = () => ({
  cachedChunks: chunkCache.size,
  pendingChunks: pending.length,
  generatedLastUpdate,
});

export const subscribeWorld = (listener: () => void): (() => void) => {
  listeners.add(listener);

  return () => listeners.delete(listener);
};

export const getWorldRevision = (): number => revision;

export const rampAt = (x: number, z: number) =>
  world.ramps.find((ramp) => {
    const height = rampHeightAt(ramp, x, z);
    return height !== null && height >= terrain.heightAt(x, z);
  });

export const drivingTerrain = createDrivingSurface(terrain, () => world.ramps);
export const groundHeight = drivingTerrain.heightAt;

export { terrain };
