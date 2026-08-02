import * as THREE from "three";
import { BreakInfo, WorldState } from "@/lib/types";
import {
  GRAVITY,
  MAX_PARTICLES,
  PARTICLE_LIFE,
  PARTICLE_SPEED,
} from "@/components/Effects/lib/constants";

const positions = new Float32Array(MAX_PARTICLES * 3);
const colors = new Float32Array(MAX_PARTICLES * 3);
const velocities = new Float32Array(MAX_PARTICLES * 3);
const lifetimes = new Float32Array(MAX_PARTICLES);
const tempColor = new THREE.Color();

let cursor = 0;
let lastBreakAt = -1;

export const createParticleTexture = (): THREE.Texture => {
  const canvas = document.createElement("canvas");
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext("2d");

  if (ctx) {
    const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    gradient.addColorStop(0, "rgba(255,255,255,1)");
    gradient.addColorStop(0.4, "rgba(255,255,255,0.6)");
    gradient.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 64, 64);
  }

  const texture = new THREE.CanvasTexture(canvas);

  return texture;
};

const spawnParticle = (position: THREE.Vector3): void => {
  const index = cursor;
  cursor = (cursor + 1) % MAX_PARTICLES;

  positions[index * 3] = position.x;
  positions[index * 3 + 1] = position.y;
  positions[index * 3 + 2] = position.z;

  const angle = Math.random() * Math.PI * 2;
  const speed = PARTICLE_SPEED * (0.5 + Math.random() * 0.8);
  velocities[index * 3] = Math.cos(angle) * speed;
  velocities[index * 3 + 1] = PARTICLE_SPEED * (0.6 + Math.random() * 0.8);
  velocities[index * 3 + 2] = Math.sin(angle) * speed;

  lifetimes[index] = PARTICLE_LIFE * (0.7 + Math.random() * 0.5);
};

export const updateParticles = (
  world: WorldState,
  dt: number,
  geometry: THREE.BufferGeometry,
): void => {
  if (world.lastBreak && world.lastBreak.at !== lastBreakAt) {
    lastBreakAt = world.lastBreak.at;
    const burst = world.lastBreak as BreakInfo;

    for (let i = 0; i < burst.shards * 4; i += 1) {
      spawnParticle(
        new THREE.Vector3(burst.position.x, burst.position.y, burst.position.z),
      );
    }
  }

  for (let i = 0; i < MAX_PARTICLES; i += 1) {
    if (lifetimes[i] <= 0) {
      positions[i * 3 + 1] = -1000;

      continue;
    }

    velocities[i * 3 + 1] -= GRAVITY * dt;
    positions[i * 3] += velocities[i * 3] * dt;
    positions[i * 3 + 1] += velocities[i * 3 + 1] * dt;
    positions[i * 3 + 2] += velocities[i * 3 + 2] * dt;
    lifetimes[i] -= dt;

    const life = Math.max(0, lifetimes[i] / PARTICLE_LIFE);
    tempColor.set(i % 2 === 0 ? "#fbbf24" : "#38bdf8");
    tempColor.multiplyScalar(life);
    colors[i * 3] = tempColor.r;
    colors[i * 3 + 1] = tempColor.g;
    colors[i * 3 + 2] = tempColor.b;
  }

  geometry.attributes.position.needsUpdate = true;
  geometry.attributes.color.needsUpdate = true;
};
