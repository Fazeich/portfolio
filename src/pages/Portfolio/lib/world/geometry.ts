import * as THREE from "three";
import { hash2 } from "@/lib/random";
import { CHUNK_SIZE } from "../constants";
import { BIOMES } from "./biomes";
import { Terrain } from "./terrain";
import { Chunk } from "./types";

const low = new THREE.Color();
const high = new THREE.Color();
const vertex = new THREE.Color();
const cache = new WeakMap<Chunk, THREE.BufferGeometry>();

const buildChunk = (cx: number, cz: number, terrain: Terrain): THREE.BufferGeometry => {
  const geometry = new THREE.PlaneGeometry(
    CHUNK_SIZE,
    CHUNK_SIZE,
    CHUNK_SIZE,
    CHUNK_SIZE,
  );

  geometry.rotateX(-Math.PI / 2);

  const centerX = cx * CHUNK_SIZE + CHUNK_SIZE / 2;
  const centerZ = cz * CHUNK_SIZE + CHUNK_SIZE / 2;
  const position = geometry.attributes.position;
  const colors = new Float32Array(position.count * 3);

  for (let i = 0; i < position.count; i += 1) {
    const worldX = centerX + position.getX(i);
    const worldZ = centerZ + position.getZ(i);
    const height = terrain.heightAt(worldX, worldZ);

    position.setY(i, height);

    const biome = BIOMES[terrain.biomeAt(worldX, worldZ)];
    const blend = THREE.MathUtils.clamp((height + 1) / 11, 0, 1);

    low.set(biome.low);
    high.set(biome.high);
    vertex.copy(low).lerp(high, blend);
    vertex.offsetHSL(0, 0, (hash2(worldX, worldZ, 7) - 0.5) * 0.1);

    colors[i * 3] = vertex.r;
    colors[i * 3 + 1] = vertex.g;
    colors[i * 3 + 2] = vertex.b;
  }

  geometry.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
  geometry.computeVertexNormals();

  return geometry;
};

export const getChunkGeometry = (chunk: Chunk, terrain: Terrain): THREE.BufferGeometry => {
  let geometry = cache.get(chunk);
  if (!geometry) {
    geometry = buildChunk(chunk.cx, chunk.cz, terrain);
    cache.set(chunk, geometry);
  }
  return geometry;
};

export const disposeChunkGeometry = (chunk: Chunk): void => {
  cache.get(chunk)?.dispose();
  cache.delete(chunk);
};
