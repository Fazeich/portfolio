export const ROOM_COLS = 60;
export const ROOM_ROWS = 40;

export const ROOM_WIDTH = ROOM_COLS;
export const ROOM_DEPTH = ROOM_ROWS;

export const HALF_W = ROOM_WIDTH / 2;
export const HALF_D = ROOM_DEPTH / 2;

export const WALL_THICKNESS = 2;
export const PLAYER_MARGIN = WALL_THICKNESS + 0.5;

export const GROUND_EXTENT = 2000;
export const WALL_HEIGHT = 2.4;
export const WALL_SIZE = 0.4;

export const PLAYER_SPEED = 6;
export const PLAYER_HEIGHT = 1.7;
export const PLAYER_RADIUS = 0.45;
export const WALK_CYCLE_SPEED = 1.8;
export const BLEND_SPEED = 12;
export const TURN_SPEED = 18;
export const BOB_AMPLITUDE = 0.03;
export const PELVIS_SWAY = 0.08;
export const SPINE_SWAY = 0.04;
export const SPINE_FORWARD = 0.02;
export const HEAD_SWAY = 0.02;
export const SHOULDER_SHRUG = 0.04;

export const INTERACTION_RADIUS = 3.6;
export const ANIMATION_DURATION = 4;

export const PLAYER_SPAWN = { x: 0, z: 0 };

export interface AltarDef {
  id: string;
  position: { x: number; z: number };
  text: string;
  label: string;
  keyHint: string;
  halfW: number;
  halfD: number;
  height: number;
  target: string;
}

export const ALTARS: AltarDef[] = [
  {
    id: "snake",
    position: { x: -24, z: -14 },
    text: "Snake 3D",
    label: "3D Snake",
    keyHint: "E / У",
    halfW: 1.2,
    halfD: 0.9,
    height: 2.6,
    target: "/snake",
  },
  {
    id: "letters",
    position: { x: 24, z: -14 },
    text: "Letter Rain",
    label: "Letter Rain",
    keyHint: "E / У",
    halfW: 1.2,
    halfD: 0.9,
    height: 2.6,
    target: "/letters",
  },
];

export const CAMERA_HEIGHT = 18;
export const CAMERA_BACK = 15;
