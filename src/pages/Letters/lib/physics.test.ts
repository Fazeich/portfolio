import { describe, expect, it } from "vitest";
import { AREA_HALF_W, AREA_HEIGHT, MAX_LETTERS } from "./constants";
import { stepLetters } from "./physics";
import { getLetterScale } from "./world";
import { createLettersWorld, spawnLetter } from "./world";

const stepped = (steps: number, dt = 0.1) => {
  const world = createLettersWorld();

  world.letterScale = 3;
  spawnLetter(world, "A");

  for (let i = 0; i < steps; i += 1) {
    stepLetters(world, dt);
  }

  return world;
};

describe("stepLetters", () => {
  it("applies gravity while airborne", () => {
    const world = createLettersWorld();

    world.letterScale = 3;
    spawnLetter(world, "A");

    const y0 = world.letters[0].pos.y;

    stepLetters(world, 0.1);

    expect(world.letters[0].pos.y).toBeLessThan(y0);
  });

  it("settles on the floor instead of falling through it", () => {
    const world = stepped(60);
    const letter = world.letters[0];
    const scale = getLetterScale(world, letter);
    const halfH = letter.baseHalfH * scale;

    expect(letter.pos.y).toBeCloseTo(halfH, 2);
    expect(letter.resting).toBe(true);
  });

  it("does not clamp at the top boundary", () => {
    const world = stepped(10);
    const letter = world.letters[0];

    expect(letter.pos.y).toBeLessThan(AREA_HEIGHT);
  });

  it("clamps letters inside the side walls", () => {
    const world = createLettersWorld();

    world.letterScale = 3;
    spawnLetter(world, "A");

    const letter = world.letters[0];

    letter.pos.set(100, 5, 0);
    letter.vel.set(0, 0, 0);
    stepLetters(world, 0.1);

    const scale = getLetterScale(world, letter);

    expect(letter.pos.x).toBeLessThanOrEqual(AREA_HALF_W - letter.baseHalfW * scale);
  });

  it("keeps every letter in a single row (depth is fixed)", () => {
    const world = createLettersWorld();

    world.letterScale = 3;
    spawnLetter(world, "A");
    spawnLetter(world, "B");

    const a = world.letters[0];
    const b = world.letters[1];

    a.pos.set(0, 5, 100);
    b.pos.set(2, 8, -100);

    for (let i = 0; i < 30; i += 1) {
      stepLetters(world, 0.1);
    }

    expect(a.pos.z).toBe(0);
    expect(b.pos.z).toBe(0);
  });

  it("keeps all stacked letters above the field bottom", () => {
    const world = createLettersWorld();

    world.letterScale = 3;

    for (let i = 0; i < 15; i += 1) {
      spawnLetter(world, String.fromCharCode(65 + (i % 26)));
    }

    world.letters.forEach((letter, i) => {
      letter.pos.set((i % 5) * 1.2 - 2.4, 5 + (i % 3) * 3, 0);
      letter.vel.set(0, 0, 0);
    });

    for (let i = 0; i < 400; i += 1) {
      stepLetters(world, 1 / 60);
    }

    for (const letter of world.letters) {
      const scale = getLetterScale(world, letter);
      const bottom = letter.pos.y - letter.baseHalfH * scale;

      expect(bottom).toBeGreaterThanOrEqual(-0.01);
    }
  });

  it("keeps the landed tilt instead of restoring it to flat", () => {
    const world = createLettersWorld();

    world.letterScale = 3;
    spawnLetter(world, "A");

    const letter = world.letters[0];

    letter.pos.set(0, 1.6, 0);
    letter.vel.set(0, 0, 0);
    letter.tiltX = 0.2;
    letter.tiltZ = -0.15;
    letter.tiltVelX = 0;
    letter.tiltVelZ = 0;

    for (let i = 0; i < 120; i += 1) {
      stepLetters(world, 1 / 60);
    }

    expect(letter.resting).toBe(true);
    expect(letter.tiltX).toBeGreaterThan(0.15);
    expect(letter.tiltZ).toBeLessThan(-0.1);
  });

  it("separates two overlapping letters", () => {
    const world = createLettersWorld();

    world.letterScale = 3;
    spawnLetter(world, "A");
    spawnLetter(world, "B");

    const a = world.letters[0];
    const b = world.letters[1];

    a.pos.set(0, 3, 0);
    b.pos.set(0, 3, 0);
    a.vel.set(0, 0, 0);
    b.vel.set(0, 0, 0);

    stepLetters(world, 0.1);

    const sa = getLetterScale(world, a);
    const sb = getLetterScale(world, b);
    const ox = a.baseHalfW * sa + b.baseHalfW * sb - Math.abs(a.pos.x - b.pos.x);
    const oy = a.baseHalfH * sa + b.baseHalfH * sb - Math.abs(a.pos.y - b.pos.y);

    expect(ox <= 0.01 || oy <= 0.01).toBe(true);
  });
});

describe("spawnLetter", () => {
  it("starts a letter above the area top", () => {
    const world = createLettersWorld();

    spawnLetter(world, "A");

    expect(world.letters[0].pos.y).toBeGreaterThan(AREA_HEIGHT);
  });

  it("evicts the oldest letter beyond the cap", () => {
    const world = createLettersWorld();

    for (let i = 0; i < MAX_LETTERS + 1; i += 1) {
      spawnLetter(world, "A");
    }

    expect(world.letters.length).toBe(MAX_LETTERS);
    expect(world.letters[0].id).toBe(1);
  });
});

describe("getLetterScale", () => {
  it("scales each letter so both dimensions reach the required world size", () => {
    const world = createLettersWorld();

    world.letterScale = 3;
    spawnLetter(world, "i");
    spawnLetter(world, "W");

    for (const letter of world.letters) {
      const scale = getLetterScale(world, letter);

      expect(letter.boxW * scale).toBeGreaterThanOrEqual(world.letterScale - 1e-6);
      expect(letter.boxH * scale).toBeGreaterThanOrEqual(world.letterScale - 1e-6);
    }
  });
});
