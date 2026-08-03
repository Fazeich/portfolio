import { Vec3 } from "@/lib/types";

export const clamp = (value: number, min: number, max: number): number =>
  Math.min(max, Math.max(min, value));

export const distance3 = (a: Vec3, b: Vec3): number => {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  const dz = a.z - b.z;

  return Math.sqrt(dx * dx + dy * dy + dz * dz);
};

export const shortestAngle = (from: Vec3, to: Vec3): number =>
  Math.atan2(from.x * to.z - from.z * to.x, from.x * to.x + from.z * to.z);
