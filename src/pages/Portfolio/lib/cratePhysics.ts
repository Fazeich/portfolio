export const CRATE_HALF = 0.42;
const SIZE = CRATE_HALF * 2;
const GRAVITY = 22;

export interface CrateBody {
  x: number; y: number; z: number;
  vx: number; vy: number; vz: number;
  rx: number; ry: number; rz: number;
  wx: number; wy: number; wz: number;
  resting: boolean;
}
export interface CratePlayer {
  x: number; y: number; z: number;
  vx: number; vz: number; radius: number;
}
export const createCrateBody = (x: number, y: number, z: number, ry = 0): CrateBody => ({
  x, y, z, ry, rx: 0, rz: 0, vx: 0, vy: 0, vz: 0,
  wx: 0, wy: 0, wz: 0, resting: true,
});
const overlaps = (a: CrateBody, b: CrateBody) =>
  Math.abs(a.x - b.x) < SIZE - 0.02 && Math.abs(a.z - b.z) < SIZE - 0.02;
const halfHeight = (body: CrateBody): number => {
  const cx = Math.cos(body.rx), sx = Math.sin(body.rx);
  const cy = Math.cos(body.ry), sy = Math.sin(body.ry);
  const cz = Math.cos(body.rz), sz = Math.sin(body.rz);
  return CRATE_HALF * (Math.abs(cx * sz + sx * sy * cz) +
    Math.abs(cx * cz - sx * sy * sz) + Math.abs(sx * cy));
};
const supported = (body: CrateBody, bodies: CrateBody[], heightAt: (x: number, z: number) => number) =>
  body.y <= heightAt(body.x, body.z) + halfHeight(body) + 0.015 ||
  bodies.some((other) => other !== body && overlaps(body, other) &&
    Math.abs(body.y - other.y - SIZE) < 0.025 && Math.abs(other.vy) < 0.15);

/** Local substepped equal-mass box contacts; distant sleeping piles are omitted by the caller. */
export const stepCrates = (
  bodies: CrateBody[], player: CratePlayer,
  heightAt: (x: number, z: number) => number, delta: number,
): void => {
  if (!Number.isFinite(delta) || delta <= 0) return;
  const duration = Math.min(delta, 0.05);
  const steps = Math.ceil(duration * 120);
  const dt = duration / steps;
  for (let step = 0; step < steps; step += 1) {
    const px = player.x - player.vx * (duration - (step + 1) * dt);
    const pz = player.z - player.vz * (duration - (step + 1) * dt);
    for (const body of bodies) {
      if (body.resting && !supported(body, bodies, heightAt)) body.resting = false;
      const dx = body.x - px, dz = body.z - pz;
      const distance = Math.hypot(dx, dz);
      const radius = player.radius + CRATE_HALF;
      if (distance < radius && body.y + CRATE_HALF > player.y && body.y - CRATE_HALF < player.y + 0.9) {
        const nx = distance > 0.001 ? dx / distance : 1;
        const nz = distance > 0.001 ? dz / distance : 0;
        const closing = (player.vx - body.vx) * nx + (player.vz - body.vz) * nz;
        body.x += nx * (radius - distance);
        body.z += nz * (radius - distance);
        // Only approaching contacts add energy: holding contact cannot repeatedly launch a box.
        if (closing > 0.15) {
          const impulse = Math.min(22, closing * 1.05);
          body.vx += nx * impulse;
          body.vz += nz * impulse;
          body.vy += Math.min(5.5, impulse * 0.24);
          body.wx += nz * impulse * 0.42;
          body.wz -= nx * impulse * 0.42;
          body.wy += (player.vx * nz - player.vz * nx) * 0.2;
          body.resting = false;
        }
      }
      if (body.resting) continue;
      body.vy -= GRAVITY * dt;
      body.x += body.vx * dt; body.y += body.vy * dt; body.z += body.vz * dt;
      body.rx += body.wx * dt; body.ry += body.wy * dt; body.rz += body.wz * dt;
      const airDrag = Math.exp(-0.35 * dt);
      body.vx *= airDrag; body.vz *= airDrag;
      body.wx *= airDrag; body.wy *= airDrag; body.wz *= airDrag;
      const floor = heightAt(body.x, body.z) + halfHeight(body);
      if (body.y <= floor) {
        body.y = floor;
        if (body.vy < 0) body.vy = body.vy < -2 ? -body.vy * 0.22 : 0;
        const friction = Math.exp(-7 * dt);
        body.vx *= friction; body.vz *= friction;
        body.wx *= friction; body.wy *= friction; body.wz *= friction;
        // A tumbling cube settles on the nearest face.
        body.rx += (Math.round(body.rx / (Math.PI / 2)) * Math.PI / 2 - body.rx) * (1 - friction);
        body.rz += (Math.round(body.rz / (Math.PI / 2)) * Math.PI / 2 - body.rz) * (1 - friction);
      }
    }
    // A few contact iterations transfer the impact through a stack without explosions.
    for (let iteration = 0; iteration < 3; iteration += 1) {
      for (let i = 0; i < bodies.length; i += 1) {
        for (let j = i + 1; j < bodies.length; j += 1) {
          const a = bodies[i], b = bodies[j];
          if (a.resting && b.resting) continue;
          const dx = b.x - a.x, dy = b.y - a.y, dz = b.z - a.z;
          const ox = SIZE - Math.abs(dx), oy = halfHeight(a) + halfHeight(b) - Math.abs(dy), oz = SIZE - Math.abs(dz);
          if (ox <= 0 || oy <= 0 || oz <= 0) continue;
          if (oy <= ox && oy <= oz) {
            const upper = dy >= 0 ? b : a, lower = dy >= 0 ? a : b;
            upper.y += oy;
            if (upper.vy < lower.vy) upper.vy = lower.vy;
            upper.vx *= Math.exp(-3 * dt); upper.vz *= Math.exp(-3 * dt);
          } else {
            const axis = ox <= oz ? "x" : "z";
            const velocity = axis === "x" ? "vx" : "vz";
            const sign = b[axis] >= a[axis] ? 1 : -1;
            const depth = axis === "x" ? ox : oz;
            a[axis] -= sign * depth * 0.5; b[axis] += sign * depth * 0.5;
            const closing = (a[velocity] - b[velocity]) * sign;
            if (closing > 0) {
              const impulse = closing * 0.58;
              a[velocity] -= sign * impulse; b[velocity] += sign * impulse;
              a.resting = b.resting = false;
            }
          }
        }
      }
    }
    for (const body of bodies) {
      body.y = Math.max(body.y, heightAt(body.x, body.z) + halfHeight(body));
      if (supported(body, bodies, heightAt) && Math.hypot(body.vx, body.vy, body.vz) < 0.09 && Math.hypot(body.wx, body.wy, body.wz) < 0.12) {
        body.resting = true;
        body.vx = body.vy = body.vz = body.wx = body.wy = body.wz = 0;
        body.rx = Math.round(body.rx / (Math.PI / 2)) * Math.PI / 2;
        body.rz = Math.round(body.rz / (Math.PI / 2)) * Math.PI / 2;
      }
    }
  }
};
