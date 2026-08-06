import * as THREE from "three";

export interface LetterEntity {
  id: number;
  char: string;
  pos: THREE.Vector3;
  vel: THREE.Vector3;
  tiltX: number;
  tiltZ: number;
  tiltVelX: number;
  tiltVelZ: number;
  boxW: number;
  boxH: number;
  baseHalfW: number;
  baseHalfH: number;
  baseHalfD: number;
  resting: boolean;
}

export interface LettersWorld {
  letters: LetterEntity[];
  nextId: number;
  pxPerWorld: number;
  letterScale: number;
}
