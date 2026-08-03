import { describe, expect, it } from "vitest";
import { isGameOver, segmentRadius, stepWorld } from "@/lib/physics";
import { createInput, createWorld } from "@/lib/world";
import {
  HEAD_RADIUS,
  MAX_SEGMENTS,
  SEGMENT_SPACING,
} from "@/lib/constants";

const noInput = createInput();

describe("segmentRadius", () => {
  it("returns the head radius for the head", () => {
    expect(segmentRadius(0)).toBe(HEAD_RADIUS);
  });

  it("tapers toward the tail", () => {
    const head = segmentRadius(0);
    const mid = segmentRadius(MAX_SEGMENTS / 2);
    const tail = segmentRadius(MAX_SEGMENTS - 1);

    expect(tail).toBeLessThan(mid);
    expect(mid).toBeLessThan(head);
    expect(tail).toBeGreaterThan(0);
  });
});

describe("isGameOver", () => {
  it("is false while hp remains", () => {
    const world = createWorld();

    expect(isGameOver(world)).toBe(false);
  });

  it("is true when hp is zero", () => {
    const world = createWorld();
    world.hp = 0;

    expect(isGameOver(world)).toBe(true);
  });
});

describe("stepWorld", () => {
  it("moves the head along the heading", () => {
    const world = createWorld();
    const startX = world.snake.positions[0].x;

    stepWorld(world, noInput, { x: 0, y: 0, z: 1 }, 0.1);

    expect(world.snake.positions[0].x).toBeGreaterThan(startX);
  });

  it("reduces hp on a wall impact", () => {
    const world = createWorld();
    const hpBefore = world.hp;

    world.snake.heading = { x: 0, y: 0, z: 1 };
    world.snake.desiredHeading = { x: 0, y: 0, z: 1 };

    let damaged = false;

    for (let i = 0; i < 600; i += 1) {
      const result = stepWorld(world, noInput, { x: 0, y: 0, z: 1 }, 0.05);

      if (result.damageTaken) {
        damaged = true;

        break;
      }
    }

    expect(damaged).toBe(true);
    expect(world.hp).toBe(hpBefore - 1);
  });

  it("breaks food on a boost ram and tracks the break", () => {
    const world = createWorld();
    const boostInput = createInput();
    boostInput.boosting = true;

    world.foods = [];
    world.snake.heading = { x: 1, y: 0, z: 0 };
    world.snake.desiredHeading = { x: 1, y: 0, z: 0 };

    const head = world.snake.positions[0];
    world.foods.push({
      position: { x: head.x + 2, y: head.y, z: head.z },
      velocity: { x: 0, y: 0, z: 0 },
    });

    let broke = false;

    for (let i = 0; i < 120; i += 1) {
      stepWorld(world, boostInput, { x: 0, y: 0, z: 1 }, 0.05);

      if (world.activeBreaks.length > 0) {
        broke = true;

        break;
      }
    }

    expect(broke).toBe(true);
    expect(world.shards.length).toBeGreaterThan(0);
    expect(world.activeBreaks[0].remaining).toBe(world.shards.length);
  });

  it("does not break the shell without boost", () => {
    const world = createWorld();

    world.foods = [];
    world.snake.heading = { x: 1, y: 0, z: 0 };
    world.snake.desiredHeading = { x: 1, y: 0, z: 0 };

    const head = world.snake.positions[0];
    world.foods.push({
      position: { x: head.x + 2, y: head.y, z: head.z },
      velocity: { x: 0, y: 0, z: 0 },
    });

    for (let i = 0; i < 120; i += 1) {
      stepWorld(world, noInput, { x: 0, y: 0, z: 1 }, 0.05);
    }

    expect(world.activeBreaks.length).toBe(0);
    expect(world.shards.length).toBe(0);
  });

  it("keeps body segments evenly spaced", () => {
    const world = createWorld();

    for (let i = 0; i < 60; i += 1) {
      stepWorld(world, noInput, { x: 0, y: 0, z: 1 }, 0.05);
    }

    const positions = world.snake.positions;

    for (let i = 1; i < positions.length; i += 1) {
      const dx = positions[i].x - positions[i - 1].x;
      const dz = positions[i].z - positions[i - 1].z;
      const dist = Math.sqrt(dx * dx + dz * dz);

      expect(dist).toBeCloseTo(SEGMENT_SPACING, 3);
    }
  });
});
