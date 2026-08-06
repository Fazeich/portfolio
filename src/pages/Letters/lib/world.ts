import * as THREE from "three";
import {
  AREA_HALF_W,
  AREA_HEIGHT,
  INITIAL_VY,
  MAX_LETTERS,
  SPAWN_MARGIN_X,
  SPAWN_MARGIN_Y,
  TILT_VELOCITY,
} from "./constants";
import { getLetterBox } from "./geometry";
import { LetterEntity, LettersWorld } from "./types";

const spawnX = (): number => {
  const minX = -AREA_HALF_W + SPAWN_MARGIN_X;
  const maxX = AREA_HALF_W - SPAWN_MARGIN_X;

  return minX + Math.random() * (maxX - minX);
};

export const getLetterScale = (world: LettersWorld, letter: LetterEntity): number => {
  return Math.max(world.letterScale / letter.boxW, world.letterScale / letter.boxH);
};

export const createLettersWorld = (): LettersWorld => ({
  letters: [],
  nextId: 0,
  pxPerWorld: 100,
  letterScale: 3,
});

export const spawnLetter = (world: LettersWorld, char: string): void => {
  if (world.letters.length >= MAX_LETTERS) {
    world.letters.shift();
  }

  const box = getLetterBox(char);

  world.letters.push({
    id: world.nextId,
    char,
    pos: new THREE.Vector3(spawnX(), AREA_HEIGHT + SPAWN_MARGIN_Y, 0),
    vel: new THREE.Vector3(0, INITIAL_VY, 0),
    tiltX: 0,
    tiltZ: 0,
    tiltVelX: (Math.random() - 0.5) * TILT_VELOCITY,
    tiltVelZ: (Math.random() - 0.5) * TILT_VELOCITY,
    boxW: box.w,
    boxH: box.h,
    baseHalfW: box.w / 2,
    baseHalfH: box.h / 2,
    baseHalfD: box.d / 2,
    resting: false,
  });
  world.nextId += 1;
};

export const clearWorldLetters = (world: LettersWorld): void => {
  world.letters.length = 0;
};
