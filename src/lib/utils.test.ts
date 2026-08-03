import { describe, expect, it } from "vitest";
import { clamp, distance3, shortestAngle } from "@/lib/utils";

describe("clamp", () => {
  it("keeps values within bounds", () => {
    expect(clamp(5, 0, 10)).toBe(5);
    expect(clamp(-1, 0, 10)).toBe(0);
    expect(clamp(11, 0, 10)).toBe(10);
  });
});

describe("distance3", () => {
  it("computes euclidean distance", () => {
    expect(distance3({ x: 0, y: 0, z: 0 }, { x: 3, y: 4, z: 0 })).toBe(5);
  });

  it("returns 0 for identical points", () => {
    const p = { x: 1, y: 2, z: 3 };

    expect(distance3(p, p)).toBe(0);
  });
});

describe("shortestAngle", () => {
  it("returns 0 for identical directions", () => {
    expect(shortestAngle({ x: 1, y: 0, z: 0 }, { x: 1, y: 0, z: 0 })).toBe(0);
  });

  it("returns PI/2 for a quarter turn", () => {
    expect(shortestAngle({ x: 1, y: 0, z: 0 }, { x: 0, y: 0, z: 1 })).toBeCloseTo(
      Math.PI / 2,
    );
  });

  it("returns -PI/2 for the opposite quarter turn", () => {
    expect(shortestAngle({ x: 1, y: 0, z: 0 }, { x: 0, y: 0, z: -1 })).toBeCloseTo(
      -Math.PI / 2,
    );
  });
});
