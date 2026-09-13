import { hash2 } from "@/lib/random";

const smooth = (t: number): number => t * t * (3 - 2 * t);

export const valueNoise = (x: number, z: number, seed: number): number => {
  const xi = Math.floor(x);
  const zi = Math.floor(z);
  const u = smooth(x - xi);
  const v = smooth(z - zi);

  const a = hash2(xi, zi, seed);
  const b = hash2(xi + 1, zi, seed);
  const c = hash2(xi, zi + 1, seed);
  const d = hash2(xi + 1, zi + 1, seed);

  return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
};

export const fbm = (
  x: number,
  z: number,
  seed: number,
  octaves = 4,
  lacunarity = 2,
  gain = 0.5,
): number => {
  let amplitude = 1;
  let frequency = 1;
  let sum = 0;
  let norm = 0;

  for (let i = 0; i < octaves; i += 1) {
    sum += valueNoise(x * frequency, z * frequency, seed + i * 131) * amplitude;
    norm += amplitude;
    amplitude *= gain;
    frequency *= lacunarity;
  }

  return sum / norm;
};

export const smoothstep = (
  edge0: number,
  edge1: number,
  value: number,
): number => {
  const t = Math.min(1, Math.max(0, (value - edge0) / (edge1 - edge0)));

  return t * t * (3 - 2 * t);
};
