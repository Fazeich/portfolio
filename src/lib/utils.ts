import { Vec3 } from "@/lib/types";

export const clamp = (value: number, min: number, max: number): number =>
  Math.min(max, Math.max(min, value));

export const lengthXZ = (v: Vec3): number => Math.sqrt(v.x * v.x + v.z * v.z);

export const normalizeXZ = (v: Vec3): Vec3 => {
  const len = lengthXZ(v);

  if (len === 0) {
    return { x: 0, y: 0, z: 0 };
  }

  return { x: v.x / len, y: v.y, z: v.z / len };
};

export const distance3 = (a: Vec3, b: Vec3): number => {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  const dz = a.z - b.z;

  return Math.sqrt(dx * dx + dy * dy + dz * dz);
};

export const shortestAngle = (from: Vec3, to: Vec3): number =>
  Math.atan2(from.x * to.z - from.z * to.x, from.x * to.x + from.z * to.z);

export const rotateY = (v: Vec3, angle: number): Vec3 => ({
  x: v.x * Math.cos(angle) + v.z * Math.sin(angle),
  y: v.y,
  z: -v.x * Math.sin(angle) + v.z * Math.cos(angle),
});
