export const seeded = (index: number, seed = 0): number => {
  const x = Math.sin((index + seed * 1009) * 127.1 + 311.7) * 43758.5453;

  return x - Math.floor(x);
};
