import { describe, expect, it } from "vitest";
import { chance, createRng, hash2, seeded } from "@/lib/random";

describe("random", () => {
  it("produces deterministic values in [0, 1)", () => {
    for (let i = 0; i < 40; i += 1) {
      const value = seeded(i, 7);

      expect(value).toBeGreaterThanOrEqual(0);
      expect(value).toBeLessThan(1);
      expect(seeded(i, 7)).toBe(value);
    }
  });

  it("hashes 2d coordinates deterministically", () => {
    expect(hash2(3, 4, 11)).toBe(hash2(3, 4, 11));
    expect(hash2(3, 4, 11)).not.toBe(hash2(4, 3, 11));
  });

  it("repeats the same rng sequence for the same seed", () => {
    const first = createRng(42);
    const second = createRng(42);
    const a = [first(), first(), first()];
    const b = [second(), second(), second()];

    expect(a).toEqual(b);
    expect(createRng(43)()).not.toBe(a[0]);
  });

  it("gates events through chance", () => {
    expect(chance(() => 0.2, 0.5)).toBe(true);
    expect(chance(() => 0.8, 0.5)).toBe(false);
  });
});
