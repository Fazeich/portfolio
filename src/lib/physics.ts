import {
  ARENA_DEPTH,
  ARENA_WIDTH,
  BOOST_DRAIN,
  BOOST_MAX,
  BOOST_COOLDOWN,
  BOOST_MIN,
  BOOST_REGEN,
  FOOD_RADIUS,
  FOOD_SHELL_RADIUS,
  FOOD_SPAWN_DELAY,
  GROWTH_PER_SHARD,
  HEAD_RADIUS,
  INVULN_TIME,
  MAX_FOODS,
  MAX_SEGMENTS,
  MAX_TURN_RATE,
  SEGMENT_RADIUS,
  SEGMENT_SPACING,
  SHELL_BREAK_SPEED,
  SHARD_BONUS,
  SHARD_COUNT_MAX,
  SHARD_COUNT_MIN,
  SHARD_GRAVITY,
  SHARD_INERT_TIME,
  SHARD_LIFETIME,
  SHARD_RADIUS,
  SHARD_RESTITUTION,
  SHARD_SCORE,
  SHARD_SPEED,
  SNAKE_BOOST_SPEED,
  SNAKE_SPEED,
  WALL_KNOCKBACK,
} from "@/lib/constants";
import { InputState, Shard, Vec3, WorldState } from "@/lib/types";
import {
  clamp,
  distance3,
  shortestAngle,
} from "@/lib/utils";
import { spawnFood } from "@/lib/world";

export interface StepResult {
  scoreGained: number;
  damageTaken: boolean;
}

const halfW = ARENA_WIDTH / 2;
const halfD = ARENA_DEPTH / 2;

const moveResult: StepResult = { scoreGained: 0, damageTaken: false };
const shardResult: StepResult = { scoreGained: 0, damageTaken: false };
const stepResult: StepResult = { scoreGained: 0, damageTaken: false };

const reflectAxis = (
  position: Vec3,
  velocity: Vec3,
  axis: "x" | "y" | "z",
  min: number,
  max: number,
  restitution: number,
): void => {
  const value = position[axis];

  if (value < min) {
    position[axis] = min;
    velocity[axis] = -velocity[axis] * restitution;
  } else if (value > max) {
    position[axis] = max;
    velocity[axis] = -velocity[axis] * restitution;
  }
};

const updateDesiredHeading = (
  world: WorldState,
  input: InputState,
  cameraForward: Vec3,
): void => {
  const hasWASD = input.wasdDir.x !== 0 || input.wasdDir.z !== 0;

  if (hasWASD) {
    const { x: cx, z: cz } = cameraForward;
    const flen = Math.sqrt(cx * cx + cz * cz);
    const fx = flen > 0 ? cx / flen : 0;
    const fz = flen > 0 ? cz / flen : 0;
    const dx = fx * input.wasdDir.z + fz * input.wasdDir.x;
    const dz = fz * input.wasdDir.z - fx * input.wasdDir.x;
    const dlen = Math.sqrt(dx * dx + dz * dz);

    if (dlen > 0) {
      world.snake.desiredHeading = { x: dx / dlen, y: 0, z: dz / dlen };
    }

    return;
  }

  if (input.pointerActive) {
    const head = world.snake.positions[0];
    const dx = head.x - input.pointerPoint.x;
    const dz = head.z - input.pointerPoint.z;
    const dlen = Math.sqrt(dx * dx + dz * dz);

    if (dlen > 0) {
      world.snake.desiredHeading = { x: dx / dlen, y: 0, z: dz / dlen };
    }

    return;
  }

  world.snake.desiredHeading = { ...world.snake.heading };
};

const turnSnake = (world: WorldState, dt: number): void => {
  const { heading, desiredHeading } = world.snake;
  const angle = shortestAngle(heading, desiredHeading);
  const step = clamp(angle, -MAX_TURN_RATE * dt, MAX_TURN_RATE * dt);

  if (step !== 0) {
    const cos = Math.cos(step);
    const sin = Math.sin(step);
    const nx = heading.x * cos + heading.z * sin;
    heading.z = -heading.x * sin + heading.z * cos;
    heading.x = nx;
  }
};

const moveHead = (world: WorldState, dt: number): StepResult => {
  const head = world.snake.positions[0];
  const { heading, speed } = world.snake;

  moveResult.scoreGained = 0;
  moveResult.damageTaken = false;

  head.x += heading.x * speed * dt;
  head.z += heading.z * speed * dt;

  let hitWall = false;

  if (head.x < -halfW + HEAD_RADIUS) {
    head.x = -halfW + HEAD_RADIUS + WALL_KNOCKBACK;
    heading.x = -heading.x;
    world.snake.desiredHeading = { ...heading };
    hitWall = true;
  } else if (head.x > halfW - HEAD_RADIUS) {
    head.x = halfW - HEAD_RADIUS - WALL_KNOCKBACK;
    heading.x = -heading.x;
    world.snake.desiredHeading = { ...heading };
    hitWall = true;
  }

  if (head.z < -halfD + HEAD_RADIUS) {
    head.z = -halfD + HEAD_RADIUS + WALL_KNOCKBACK;
    heading.z = -heading.z;
    world.snake.desiredHeading = { ...heading };
    hitWall = true;
  } else if (head.z > halfD - HEAD_RADIUS) {
    head.z = halfD - HEAD_RADIUS - WALL_KNOCKBACK;
    heading.z = -heading.z;
    world.snake.desiredHeading = { ...heading };
    hitWall = true;
  }

  if (hitWall && world.time >= world.snake.invulnUntil) {
    world.hp = Math.max(0, world.hp - 1);
    world.snake.invulnUntil = world.time + INVULN_TIME;
    moveResult.damageTaken = true;
  }

  return moveResult;
};

const updateChain = (world: WorldState): void => {
  const { positions } = world.snake;

  for (let i = 1; i < positions.length; i += 1) {
    const prev = positions[i - 1];
    const cur = positions[i];
    const dx = cur.x - prev.x;
    const dz = cur.z - prev.z;
    const len = Math.sqrt(dx * dx + dz * dz);

    if (len > 0) {
      const ratio = SEGMENT_SPACING / len;
      cur.x = prev.x + dx * ratio;
      cur.z = prev.z + dz * ratio;
    }
  }
};

const growSnake = (world: WorldState): void => {
  const { positions } = world.snake;

  for (let i = 0; i < GROWTH_PER_SHARD; i += 1) {
    if (positions.length >= MAX_SEGMENTS) {
      return;
    }

    const tail = positions[positions.length - 1];
    positions.push({ ...tail });
  }
};

const updateBoost = (world: WorldState, input: InputState, dt: number): void => {
  const { snake } = world;
  const wasBoosting = snake.boosting;

  snake.boostCooldown = Math.max(0, snake.boostCooldown - dt);

  const wantsBoost =
    input.boosting &&
    snake.boost > 0 &&
    (snake.boosting || (snake.boost >= BOOST_MIN && snake.boostCooldown <= 0));

  if (wasBoosting && !wantsBoost) {
    snake.boostCooldown = BOOST_COOLDOWN;
  }

  if (wantsBoost) {
    snake.boost = Math.max(0, snake.boost - BOOST_DRAIN * dt);
  } else if (snake.boostCooldown <= 0) {
    snake.boost = Math.min(BOOST_MAX, snake.boost + BOOST_REGEN * dt);
  }

  snake.boosting = wantsBoost;
  snake.speed = wantsBoost ? SNAKE_BOOST_SPEED : SNAKE_SPEED;
};

const updateFoods = (world: WorldState, dt: number): void => {
  const head = world.snake.positions[0];

  for (let i = world.foods.length - 1; i >= 0; i -= 1) {
    const food = world.foods[i];

    if (food.velocity.x !== 0 || food.velocity.z !== 0) {
      food.velocity.y -= SHARD_GRAVITY * dt;
      food.velocity.x *= 0.985;
      food.velocity.z *= 0.985;
      food.position.x += food.velocity.x * dt;
      food.position.y += food.velocity.y * dt;
      food.position.z += food.velocity.z * dt;

      reflectAxis(
        food.position,
        food.velocity,
        "y",
        FOOD_RADIUS,
        Number.POSITIVE_INFINITY,
        SHARD_RESTITUTION,
      );
      reflectAxis(
        food.position,
        food.velocity,
        "x",
        -halfW + FOOD_RADIUS,
        halfW - FOOD_RADIUS,
        SHARD_RESTITUTION,
      );
      reflectAxis(
        food.position,
        food.velocity,
        "z",
        -halfD + FOOD_RADIUS,
        halfD - FOOD_RADIUS,
        SHARD_RESTITUTION,
      );

      if (Math.abs(food.velocity.x) < 0.15 && food.velocity.y < 0.15) {
        food.velocity.x = 0;
        food.velocity.z = 0;
      }
    }

    const distance = distance3(head, food.position);

    if (distance < HEAD_RADIUS + FOOD_SHELL_RADIUS) {
      const svx = world.snake.heading.x * world.snake.speed;
      const svz = world.snake.heading.z * world.snake.speed;
      const relativeSpeed = Math.sqrt(
        (svx - food.velocity.x) ** 2 + (svz - food.velocity.z) ** 2,
      );

      if (relativeSpeed >= SHELL_BREAK_SPEED) {
        breakFood(world, food);
        world.foods.splice(i, 1);
        world.foodSpawnTimer = FOOD_SPAWN_DELAY;
      } else {
        const dx = food.position.x - head.x;
        const dz = food.position.z - head.z;
        const dlen = Math.sqrt(dx * dx + dz * dz);
        const nx = dlen > 0 ? dx / dlen : 1;
        const nz = dlen > 0 ? dz / dlen : 0;
        food.velocity = {
          x: (nx || 1) * 4,
          y: 4,
          z: (nz || 0) * 4,
        };
      }
    }
  }
};

const breakFood = (world: WorldState, food: { position: Vec3 }): void => {
  const count =
    SHARD_COUNT_MIN +
    Math.floor(Math.random() * (SHARD_COUNT_MAX - SHARD_COUNT_MIN + 1));
  const breakId = world.breakCounter;

  world.breakCounter += 1;
  world.activeBreaks.push({ id: breakId, remaining: count });

  for (let i = 0; i < count; i += 1) {
    const angle = Math.random() * Math.PI * 2;
    const radial = SHARD_SPEED * (0.5 + Math.random() * 0.7);
    const shard: Shard = {
      position: { ...food.position },
      velocity: {
        x: Math.cos(angle) * radial,
        y: SHARD_SPEED * (0.6 + Math.random() * 0.5),
        z: Math.sin(angle) * radial,
      },
      radius: SHARD_RADIUS,
      bornAt: world.time,
      breakId,
      eaten: false,
    };

    world.shards.push(shard);
  }

  world.lastBreak = {
    position: { ...food.position },
    at: world.time,
    shards: count,
  };
};

const consumeBreak = (
  world: WorldState,
  breakId: number,
  awardBonus: boolean,
): void => {
  const index = world.activeBreaks.findIndex((track) => track.id === breakId);

  if (index === -1) {
    return;
  }

  const track = world.activeBreaks[index];
  track.remaining -= 1;

  if (track.remaining <= 0) {
    if (awardBonus) {
      shardResult.scoreGained += SHARD_BONUS;
    }

    world.activeBreaks.splice(index, 1);
  }
};

const updateShards = (world: WorldState, dt: number): StepResult => {
  shardResult.scoreGained = 0;
  shardResult.damageTaken = false;

  for (let i = world.shards.length - 1; i >= 0; i -= 1) {
    const shard = world.shards[i];

    if (shard.eaten) {
      world.shards.splice(i, 1);

      continue;
    }

    if (world.time - shard.bornAt > SHARD_LIFETIME) {
      world.shards.splice(i, 1);
      consumeBreak(world, shard.breakId, false);

      continue;
    }

    shard.velocity.y -= SHARD_GRAVITY * dt;
    shard.position.x += shard.velocity.x * dt;
    shard.position.y += shard.velocity.y * dt;
    shard.position.z += shard.velocity.z * dt;

    reflectAxis(
      shard.position,
      shard.velocity,
      "y",
      shard.radius,
      Number.POSITIVE_INFINITY,
      SHARD_RESTITUTION,
    );
    reflectAxis(
      shard.position,
      shard.velocity,
      "x",
      -halfW + shard.radius,
      halfW - shard.radius,
      SHARD_RESTITUTION,
    );
    reflectAxis(
      shard.position,
      shard.velocity,
      "z",
      -halfD + shard.radius,
      halfD - shard.radius,
      SHARD_RESTITUTION,
    );

    const inert = world.time - shard.bornAt < SHARD_INERT_TIME;

    if (inert) {
      continue;
    }

    const positions = world.snake.positions;
    const eatableCount = Math.min(4, positions.length);

    for (let j = 0; j < eatableCount; j += 1) {
      if (distance3(positions[j], shard.position) < HEAD_RADIUS + shard.radius) {
        shard.eaten = true;
        shardResult.scoreGained += SHARD_SCORE;
        growSnake(world);
        consumeBreak(world, shard.breakId, true);

        break;
      }
    }
  }

  return shardResult;
};

const spawnFoods = (world: WorldState, dt: number): void => {
  if (world.foods.length >= MAX_FOODS) {
    return;
  }

  if (world.foodSpawnTimer > 0) {
    world.foodSpawnTimer = Math.max(0, world.foodSpawnTimer - dt);

    return;
  }

  spawnFood(world);
};

export const stepWorld = (
  world: WorldState,
  input: InputState,
  cameraForward: Vec3,
  dt: number,
): StepResult => {
  world.time += dt;
  updateDesiredHeading(world, input, cameraForward);
  turnSnake(world, dt);
  updateBoost(world, input, dt);

  moveHead(world, dt);
  updateChain(world);
  updateFoods(world, dt);
  updateShards(world, dt);
  spawnFoods(world, dt);

  stepResult.scoreGained = shardResult.scoreGained;
  stepResult.damageTaken = moveResult.damageTaken;

  return stepResult;
};

export const isGameOver = (world: WorldState): boolean => world.hp <= 0;

export const segmentRadius = (index: number): number => {
  if (index === 0) {
    return HEAD_RADIUS;
  }

  const t = index / MAX_SEGMENTS;

  return SEGMENT_RADIUS * (1 - t * 0.4);
};
