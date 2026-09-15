import { describe, expect, it } from "vitest";
import { BEACONS, CRYSTALS } from "@/lib/expedition";
import {
  CHUNK_SIZE,
  STREAM_WINDOW_COLS,
  STREAM_WINDOW_ROWS,
} from "../constants";
import { BIOME_IDS } from "./biomes";
import { buildColliders, generateChunk, generateChunks } from "./generate";
import {
  getWorldRevision,
  getStreamingStats,
  CHUNK_CACHE_LIMIT,
  groundHeight,
  updateWorldStreaming,
  world,
} from "./index";
import { createPedestals, PEDESTAL_CHANCE } from "./pedestals";
import { getChunkGeometry } from "./geometry";
import { createTerrain } from "./terrain";

const SEED = 2026;

describe("terrain", () => {
  it("is deterministic and finite", () => {
    const a = createTerrain(SEED);
    const b = createTerrain(SEED);

    expect(a.heightAt(3.5, -8.25)).toBe(b.heightAt(3.5, -8.25));
    expect(Number.isFinite(a.heightAt(120, -90))).toBe(true);
    expect(b.biomeAt(3.5, -8.25)).toBe(a.biomeAt(3.5, -8.25));
  });

  it("returns valid biomes", () => {
    const terrain = createTerrain(SEED);

    for (let i = 0; i < 30; i += 1) {
      expect(BIOME_IDS).toContain(terrain.biomeAt(i * 5 - 40, i * 3 - 20));
    }
  });

  it("produces a unit normal", () => {
    const terrain = createTerrain(SEED);
    const normal = { x: 0, y: 0, z: 0 };

    terrain.normalAt(6, -4, normal);

    expect(Math.hypot(normal.x, normal.y, normal.z)).toBeCloseTo(1, 5);
  });
});

describe("chunk generation", () => {
  it("keeps expedition pickup areas clear across seeds and chunk borders", () => {
    for (const seed of [1, 42, 1337, 2026, 98765]) {
      const terrain = createTerrain(seed);
      for (const beacon of BEACONS) {
        const cx = Math.floor(beacon.x / CHUNK_SIZE), cz = Math.floor(beacon.z / CHUNK_SIZE);
        for (let dx = -1; dx <= 1; dx += 1) for (let dz = -1; dz <= 1; dz += 1) {
          const chunk = generateChunk(terrain, seed, cx + dx, cz + dz, createPedestals(seed));
          for (const point of [beacon, ...CRYSTALS.filter((c) => c.id.startsWith(beacon.id))]) {
            for (const prop of chunk.props.filter((p) => p.kind === "tree" || p.kind === "rock" || p.kind === "crate")) {
              expect(Math.hypot(prop.x - point.x, prop.z - point.z)).toBeGreaterThan(2.5);
            }
          }
        }
      }
    }
  });
  it("builds one chunk per grid cell", () => {
    const terrain = createTerrain(SEED);
    const chunks = generateChunks(terrain, SEED, createPedestals(SEED));

    expect(chunks).toHaveLength(STREAM_WINDOW_COLS * STREAM_WINDOW_ROWS);
    expect(chunks.every((chunk) => BIOME_IDS.includes(chunk.biome))).toBe(true);
  });

  it("is reproducible for the same seed", () => {
    const first = generateChunks(createTerrain(SEED), SEED, createPedestals(SEED));
    const second = generateChunks(createTerrain(SEED), SEED, createPedestals(SEED));
    const firstTree = first[0].props[0];
    const secondTree = second[0].props[0];

    expect(firstTree?.kind).toBe(secondTree?.kind);
    expect(firstTree?.x).toBeCloseTo(secondTree?.x ?? 0, 6);
    expect(firstTree?.z).toBeCloseTo(secondTree?.z ?? 0, 6);
  });

  it("places every prop inside the active window", () => {
    const halfW = (STREAM_WINDOW_COLS * CHUNK_SIZE) / 2;
    const halfD = (STREAM_WINDOW_ROWS * CHUNK_SIZE) / 2;

    for (const prop of world.props) {
      expect(prop.x).toBeGreaterThanOrEqual(-halfW - CHUNK_SIZE);
      expect(prop.x).toBeLessThanOrEqual(halfW + CHUNK_SIZE);
      expect(prop.z).toBeGreaterThanOrEqual(-halfD - CHUNK_SIZE);
      expect(prop.z).toBeLessThanOrEqual(halfD + CHUNK_SIZE);
      expect(Number.isFinite(prop.y)).toBe(true);
      expect(prop.scale).toBeGreaterThan(0);
    }
  });

  it("builds finite colliders with positive radius", () => {
    const colliders = buildColliders(world.props, world.pedestals);

    expect(colliders.length).toBeGreaterThan(0);

    for (const collider of colliders) {
      expect(Number.isFinite(collider.x)).toBe(true);
      expect(Number.isFinite(collider.z)).toBe(true);
      expect(collider.radius).toBeGreaterThan(0);
    }
  });
});

describe("pedestals", () => {
  it("uses a 1% chance per chunk", () => {
    expect(PEDESTAL_CHANCE).toBe(0.01);
  });

  it("guarantees the two start mini-games inside the start area", () => {
    const pedestals = createPedestals(SEED);
    const targets = pedestals.slice(0, 2).map((pedestal) => pedestal.target);

    expect(targets).toEqual(["/snake", "/letters"]);

    for (const pedestal of pedestals.slice(0, 2)) {
      expect(Number.isFinite(pedestal.position.x)).toBe(true);
      expect(Number.isFinite(pedestal.position.z)).toBe(true);
    }
  });

  it("is deterministic", () => {
    expect(createPedestals(SEED)).toEqual(createPedestals(SEED));
  });
});

describe("world singleton", () => {
  it("exposes terrain height sampling", () => {
    expect(groundHeight(0, 0)).toBe(world.terrain.heightAt(0, 0));
    expect(Number.isFinite(groundHeight(10, 10))).toBe(true);
  });

  it("streams a new 8x6 window when the player crosses chunk bounds", () => {
    updateWorldStreaming(0, 0);
    const before = getWorldRevision();

    let changed = false;
    for (let i = 0; i < 100 && !changed; i += 1) {
      changed = updateWorldStreaming(100, 0);
      expect(getStreamingStats().generatedLastUpdate).toBeLessThanOrEqual(1);
    }
    expect(changed).toBe(true);
    expect(getWorldRevision()).toBe(before + 1);
    expect(world.chunks).toHaveLength(STREAM_WINDOW_COLS * STREAM_WINDOW_ROWS);
    expect(world.chunks.some((chunk) => chunk.cx >= 4)).toBe(true);

    for (let i = 0; i < 100; i += 1) updateWorldStreaming(0, 0);
  });
});

describe("streaming resource lifetime", () => {
  it("reuses overlapping terrain geometry across a boundary", () => {
    for (let i = 0; i < 100; i += 1) updateWorldStreaming(0, 0);
    const retained = world.chunks.find((chunk) => chunk.cx === 0 && chunk.cz === 0)!;
    const geometry = getChunkGeometry(retained, world.terrain);
    for (let i = 0; i < 100; i += 1) updateWorldStreaming(17, 0);
    expect(world.chunks).toContain(retained);
    expect(getChunkGeometry(retained, world.terrain)).toBe(geometry);
  });

  it("bounds cache memory over long drives and regenerates evicted chunks", () => {
    const original = generateChunk(world.terrain, world.seed, 0, 0, []);
    for (let stop = 1; stop <= 16; stop += 1) {
      for (let i = 0; i < 100; i += 1) updateWorldStreaming(stop * 48, 0);
      expect(getStreamingStats().cachedChunks).toBeLessThanOrEqual(CHUNK_CACHE_LIMIT);
      expect(world.chunks).toHaveLength(48);
    }
    for (let i = 0; i < 100; i += 1) updateWorldStreaming(0, 0);
    expect(generateChunk(world.terrain, world.seed, 0, 0, [])).toEqual(original);
  });
});

describe("supply piles and placement", () => {
  it("adds reproducible crate piles beyond spawn without static crate colliders", () => {
    const terrain = createTerrain(SEED);
    const chunks = generateChunks(terrain, SEED, createPedestals(SEED));
    const crates = chunks.flatMap((c) => c.props.filter((p) => p.kind === "crate"));
    expect(crates.length).toBeGreaterThan(30);
    expect(crates.some((p) => Math.hypot(p.x, p.z) > 20)).toBe(true);
    expect(chunks.find((c) => c.cx === 0 && c.cz === -1)?.props.filter((p) => p.kind === "crate")).toHaveLength(9);
    expect(buildColliders(crates, [])).toEqual([]);
    expect(generateChunks(terrain, SEED, createPedestals(SEED))).toEqual(chunks);
  });

  it("keeps solid vegetation separated and within chunk margins", () => {
    const chunks = generateChunks(createTerrain(SEED), SEED, createPedestals(SEED));
    for (const chunk of chunks) {
      const solids = chunk.props.filter((p) => p.kind === "tree" || p.kind === "rock");
      for (let i = 0; i < solids.length; i += 1) {
        expect(solids[i].x - chunk.cx * CHUNK_SIZE).toBeGreaterThanOrEqual(1.6);
        for (let j = i + 1; j < solids.length; j += 1) {
          expect(Math.hypot(solids[i].x - solids[j].x, solids[i].z - solids[j].z)).toBeGreaterThan(1.6);
        }
      }
    }
  });
});
