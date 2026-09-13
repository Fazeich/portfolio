export const seeded = (index: number, seed = 0): number => {
  const x = Math.sin((index + seed * 1009) * 127.1 + 311.7) * 43758.5453;

  return x - Math.floor(x);
};

export const hash2 = (x: number, y: number, seed = 0): number => {
  const n = Math.sin(x * 127.1 + y * 311.7 + seed * 74.7) * 43758.5453;

  return n - Math.floor(n);
};

export const createRng = (seed: number): (() => number) => {
  let state = (seed >>> 0) || 1;

  return () => {
    state = (state + 0x6d2b79f5) >>> 0;

    let t = state;

    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);

    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

export const chance = (rng: () => number, probability: number): boolean =>
  rng() < probability;
