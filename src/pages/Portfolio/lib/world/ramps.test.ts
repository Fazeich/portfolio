import { describe, expect, it } from "vitest";
import { createDrivingSurface, createRampForChunk, RAMP_SIZES, Ramp, rampHeightAt } from "./ramps";
import { createTerrain, Terrain } from "./terrain";
import { createCarBody, stepCar } from "../carPhysics";
const flat: Terrain = { seed: 1, heightAt: () => 0, biomeAt: () => "meadow", normalAt: (_x, _z, out) => { out.x = out.z = 0; out.y = 1; } };
describe("ramps", () => {
  it("generates reproducible rare ramps in multiple sizes", () => {
    const ramps: Ramp[] = [];
    for (let x = -10; x <= 10; x += 1) for (let z = -10; z <= 10; z += 1) {
      const a = createRampForChunk(flat, 2026, x, z);
      expect(a).toEqual(createRampForChunk(flat, 2026, x, z));
      if (a) ramps.push(a);
    }
    expect(ramps.length).toBeGreaterThan(10);
    expect(ramps.length).toBeLessThan(100);
    expect(new Set(ramps.map((r) => r.height)).size).toBe(3);
    expect(createRampForChunk(createTerrain(2026), 2026, 0, 0)).toBeNull();
  });
  for (const [variant, size] of Array.from(RAMP_SIZES.entries())) {
    it(`launches and lands the car from ramp ${variant + 1}`, () => {
      const ramp: Ramp = {x: 0, y: 0, z: 8, heading: 0, variant, ...size};
      const surface = createDrivingSurface(flat, () => [ramp]);
      expect(rampHeightAt(ramp, 0, 8 + size.length / 2)).toBeCloseTo(size.height);
      const car = createCarBody(0, 0, 0, 0); car.speed = 18;
      let launched = false, peak = 0;
      for (let i = 0; i < 480; i += 1) {
        stepCar(car, {throttle: 1, brake: 0, steer: 0}, surface, 1 / 120);
        if (car.z > 8 + size.length / 2) {
          launched ||= car.airborne && car.vy > 0;
          peak = Math.max(peak, car.y);
        }
      }
      expect(launched).toBe(true);
      expect(peak).toBeGreaterThan(size.height + 0.2);
      expect(car.airborne).toBe(false);
      expect(Math.abs(car.y)).toBeLessThan(0.02);
    });
  }
});
