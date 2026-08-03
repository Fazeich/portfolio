import {
  ARENA_DEPTH,
  ARENA_WIDTH,
  BOOST_MAX,
  FOOD_MIN_DIST_FROM_SNAKE,
  FOOD_RADIUS,
  HEAD_RADIUS,
  MAX_FOODS,
  SEGMENT_SPACING,
  SNAKE_MAX_HP,
  START_SEGMENTS,
} from "@/lib/constants";
import { InputState, Vec3, WorldState } from "@/lib/types";
import { distance3 } from "@/lib/utils";

const START_HEADING: Vec3 = { x: 1, y: 0, z: 0 };

export const createInput = (): InputState => ({
  pointerActive: false,
  pointerPoint: { x: 0, y: 0, z: 0 },
  wasdDir: { x: 0, y: 0, z: 0 },
  boosting: false,
});

const makeHead = (): Vec3 => ({
  x: -ARENA_WIDTH / 2 + HEAD_RADIUS * 4,
  y: HEAD_RADIUS,
  z: 0,
});

const buildSegments = (): Vec3[] => {
  const head = makeHead();
  const segments: Vec3[] = [head];

  for (let i = 1; i < START_SEGMENTS; i += 1) {
    segments.push({
      x: head.x - START_HEADING.x * SEGMENT_SPACING * i,
      y: HEAD_RADIUS,
      z: head.z - START_HEADING.z * SEGMENT_SPACING * i,
    });
  }

  return segments;
};

export const spawnFood = (world: WorldState): void => {
  const halfW = ARENA_WIDTH / 2 - FOOD_RADIUS - 1;
  const halfD = ARENA_DEPTH / 2 - FOOD_RADIUS - 1;

  for (let attempt = 0; attempt < 12; attempt += 1) {
    const position: Vec3 = {
      x: (Math.random() * 2 - 1) * halfW,
      y: FOOD_RADIUS,
      z: (Math.random() * 2 - 1) * halfD,
    };

    const head = world.snake.positions[0];

    if (distance3(position, head) > FOOD_MIN_DIST_FROM_SNAKE) {
      world.foods.push({
        position,
        velocity: { x: 0, y: 0, z: 0 },
      });

      return;
    }
  }
};

export const createWorld = (): WorldState => {
  const world: WorldState = {
    time: 0,
    snake: {
      positions: buildSegments(),
      heading: { ...START_HEADING },
      desiredHeading: { ...START_HEADING },
      speed: 0,
      boost: BOOST_MAX,
      boosting: false,
      invulnUntil: 0,
    },
    foods: [],
    shards: [],
    score: 0,
    hp: SNAKE_MAX_HP,
    activeBreak: null,
    foodSpawnTimer: 0,
    lastBreak: null,
  };

  for (let i = 0; i < MAX_FOODS; i += 1) {
    spawnFood(world);
  }

  return world;
};

export const resetWorld = (world: WorldState): void => {
  const fresh = createWorld();

  world.time = fresh.time;
  world.snake = fresh.snake;
  world.foods = fresh.foods;
  world.shards = fresh.shards;
  world.score = fresh.score;
  world.hp = fresh.hp;
  world.activeBreak = fresh.activeBreak;
  world.foodSpawnTimer = fresh.foodSpawnTimer;
  world.lastBreak = fresh.lastBreak;
};
