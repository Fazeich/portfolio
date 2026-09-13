import { describe, expect, it } from "vitest";
import { createCrateBody, stepCrates } from "./cratePhysics";
const floor = () => 0;
const absent = { x: 100, y: 0, z: 100, vx: 0, vz: 0, radius: 0.6 };
const impact = (speed: number) => {
  const body = createCrateBody(0, 0.42, 0.8);
  stepCrates([body], { x: 0, y: 0, z: 0, vx: 0, vz: speed, radius: 0.6 }, floor, 1 / 30);
  return body;
};
describe("crate impacts", () => {
  it("does not inject energy when a stationary player touches a crate", () => {
    const body = impact(0);
    expect(body.vy).toBe(0);
    expect(body.vz).toBe(0);
  });
  it("scatters and tumbles more strongly at higher approach speed", () => {
    const slow = impact(3), fast = impact(16);
    expect(fast.vz).toBeGreaterThan(slow.vz * 2);
    expect(fast.vy).toBeGreaterThan(slow.vy);
    expect(Math.abs(fast.wx)).toBeGreaterThan(1);
  });
  it("does not hit ground crates from a flying car", () => {
    const body = createCrateBody(0, 0.42, 0.8);
    stepCrates([body], { x: 0, y: 3, z: 0, vx: 0, vz: 16, radius: 0.6 }, floor, 1 / 30);
    expect(body.resting).toBe(true);
    expect(body.vz).toBe(0);
  });
  it("transfers momentum to another crate without increasing kinetic energy", () => {
    const a = createCrateBody(0, 0.42, 0), b = createCrateBody(0.9, 0.42, 0);
    a.vx = 10; a.resting = false;
    stepCrates([a, b], absent, floor, 0.05);
    expect(b.vx).toBeGreaterThan(1);
    expect(a.vx ** 2 + b.vx ** 2).toBeLessThan(100);
  });
  it("wakes the upper crate when its support is removed", () => {
    const body = createCrateBody(0, 1.26, 0);
    stepCrates([body], absent, floor, 0.05);
    expect(body.y).toBeLessThan(1.26);
    expect(body.resting).toBe(false);
  });
  it("settles after a hard impact without sinking or endless bouncing", () => {
    const body = impact(18);
    for (let i = 0; i < 600; i += 1) stepCrates([body], absent, floor, 1 / 120);
    expect(body.y).toBeCloseTo(0.42, 4);
    expect(body.resting).toBe(true);
    expect(body.vx + body.vy + body.vz).toBe(0);
  });
});
