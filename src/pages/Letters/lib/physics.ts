import {
  AREA_HALF_W,
  AREA_MIN_Y,
  GRAVITY,
  MAX_FALL_SPEED,
  MAX_TILT,
  REST_SPEED_EPSILON,
  SUPPORT_EPSILON,
  TILT_AIR_DRAG,
  TILT_IMPACT_KICK,
  TILT_LIMIT_BOUNCE,
  TILT_REST_DRAG,
} from "./constants";
import { LetterEntity, LettersWorld } from "./types";
import { getLetterScale } from "./world";

const clamp = (value: number, min: number, max: number): number => {
  return Math.max(min, Math.min(max, value));
};

const stepTilt = (letter: LetterEntity, dt: number, drag: number): void => {
  letter.tiltX += letter.tiltVelX * dt;
  letter.tiltZ += letter.tiltVelZ * dt;
  letter.tiltVelX *= 1 - drag * dt;
  letter.tiltVelZ *= 1 - drag * dt;

  if (letter.tiltX > MAX_TILT) {
    letter.tiltX = MAX_TILT;
    letter.tiltVelX *= -TILT_LIMIT_BOUNCE;
  } else if (letter.tiltX < -MAX_TILT) {
    letter.tiltX = -MAX_TILT;
    letter.tiltVelX *= -TILT_LIMIT_BOUNCE;
  }

  if (letter.tiltZ > MAX_TILT) {
    letter.tiltZ = MAX_TILT;
    letter.tiltVelZ *= -TILT_LIMIT_BOUNCE;
  } else if (letter.tiltZ < -MAX_TILT) {
    letter.tiltZ = -MAX_TILT;
    letter.tiltVelZ *= -TILT_LIMIT_BOUNCE;
  }
};

const kickTilt = (letter: LetterEntity, strength: number): void => {
  letter.tiltVelX += (Math.random() - 0.5) * strength;
  letter.tiltVelZ += (Math.random() - 0.5) * strength;
};

const integrate = (world: LettersWorld, letter: LetterEntity, dt: number): void => {
  const scale = getLetterScale(world, letter);
  const halfW = letter.baseHalfW * scale;
  const halfH = letter.baseHalfH * scale;

  if (letter.resting) {
    letter.pos.x = clamp(letter.pos.x, -AREA_HALF_W + halfW, AREA_HALF_W - halfW);
    letter.pos.y = Math.max(letter.pos.y, AREA_MIN_Y + halfH);
    letter.vel.set(0, 0, 0);
    stepTilt(letter, dt, TILT_REST_DRAG);

    return;
  }

  letter.vel.y = Math.max(letter.vel.y - GRAVITY * dt, -MAX_FALL_SPEED);
  letter.pos.x += letter.vel.x * dt;
  letter.pos.y += letter.vel.y * dt;
  letter.pos.z = 0;

  stepTilt(letter, dt, TILT_AIR_DRAG);

  letter.pos.x = clamp(letter.pos.x, -AREA_HALF_W + halfW, AREA_HALF_W - halfW);

  if (letter.pos.y <= AREA_MIN_Y + halfH) {
    if (letter.vel.y < -4) {
      kickTilt(letter, TILT_IMPACT_KICK * 2);
    }

    letter.pos.y = AREA_MIN_Y + halfH;
    letter.vel.y = 0;
  }
};

const resolvePair = (
  world: LettersWorld,
  a: LetterEntity,
  b: LetterEntity,
): void => {
  const sa = getLetterScale(world, a);
  const sb = getLetterScale(world, b);
  const ax = a.baseHalfW * sa;
  const ay = a.baseHalfH * sa;
  const bx = b.baseHalfW * sb;
  const by = b.baseHalfH * sb;

  const dx = a.pos.x - b.pos.x;
  const dy = a.pos.y - b.pos.y;
  const ox = ax + bx - Math.abs(dx);
  const oy = ay + by - Math.abs(dy);

  if (ox <= 0 || oy <= 0) {
    return;
  }

  if (oy <= ox) {
    const impact = Math.abs(a.vel.y) + Math.abs(b.vel.y);
    const sign = dy >= 0 ? 1 : -1;

    a.pos.y += sign * oy * 0.5;
    b.pos.y -= sign * oy * 0.5;
    a.vel.y = 0;
    b.vel.y = 0;

    if (impact > 4) {
      kickTilt(a, TILT_IMPACT_KICK);
      kickTilt(b, TILT_IMPACT_KICK * 0.5);
    }

    return;
  }

  const sign = dx >= 0 ? 1 : -1;

  a.pos.x += sign * ox * 0.5;
  b.pos.x -= sign * ox * 0.5;

  const rel = a.vel.x - b.vel.x;

  if (sign * rel > 0) {
    a.vel.x -= sign * rel * 0.5;
    b.vel.x += sign * rel * 0.5;
  }
};

const overlapsX = (world: LettersWorld, a: LetterEntity, b: LetterEntity): boolean => {
  const sa = getLetterScale(world, a);
  const sb = getLetterScale(world, b);

  return Math.abs(a.pos.x - b.pos.x) < a.baseHalfW * sa + b.baseHalfW * sb;
};

const isSupported = (world: LettersWorld, letter: LetterEntity): boolean => {
  const scale = getLetterScale(world, letter);
  const halfH = letter.baseHalfH * scale;

  if (letter.pos.y <= AREA_MIN_Y + halfH + SUPPORT_EPSILON) {
    return true;
  }

  const bottom = letter.pos.y - halfH;

  for (const other of world.letters) {
    if (other === letter) {
      continue;
    }

    const oScale = getLetterScale(world, other);
    const top = other.pos.y + other.baseHalfH * oScale;

    if (Math.abs(bottom - top) <= SUPPORT_EPSILON && overlapsX(world, letter, other)) {
      return true;
    }
  }

  return false;
};

export const stepLetters = (world: LettersWorld, dt: number): void => {
  const letters = world.letters;

  for (const letter of letters) {
    integrate(world, letter, dt);
  }

  for (let i = 0; i < letters.length; i += 1) {
    for (let j = i + 1; j < letters.length; j += 1) {
      resolvePair(world, letters[i], letters[j]);
    }
  }

  for (const letter of letters) {
    const scale = getLetterScale(world, letter);
    const halfW = letter.baseHalfW * scale;
    const halfH = letter.baseHalfH * scale;

    letter.pos.x = clamp(letter.pos.x, -AREA_HALF_W + halfW, AREA_HALF_W - halfW);
    letter.pos.y = Math.max(letter.pos.y, AREA_MIN_Y + halfH);
  }

  for (const letter of letters) {
    const speed =
      Math.abs(letter.vel.x) + Math.abs(letter.vel.y) + Math.abs(letter.vel.z);

    letter.resting = isSupported(world, letter) && speed < REST_SPEED_EPSILON;
  }
};
