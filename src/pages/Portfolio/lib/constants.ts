export const ROOM_COLS = 60;
export const ROOM_ROWS = 40;

export const ROOM_WIDTH = ROOM_COLS;
export const ROOM_DEPTH = ROOM_ROWS;

export const HALF_W = ROOM_WIDTH / 2;
export const HALF_D = ROOM_DEPTH / 2;

export const PLAYER_MARGIN = 0.7;

export const GROUND_EXTENT = 2000;

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
  accent: string;
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
    accent: "#22c55e",
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
    accent: "#f59e0b",
  },
];

export const CAMERA_HEIGHT = 18;
export const CAMERA_BACK = 15;
export const CAMERA_FOV = 45;
export const CAMERA_FOV_NEAR_ALTAR = 52;
export const CAMERA_BLEND = 8;
export const CAMERA_LOOK_BLEND = 10;
export const CAMERA_ALTAR_FOCUS_RAISE = 2.2;
export const INTERACTION_CAMERA_SPEED = 0.3;
export const INTERACTION_CAMERA_BACK = 5.4;
export const INTERACTION_CAMERA_LOOK_Y = 0.55;
export const INTERACTION_CAMERA_HEIGHT_OFFSET = 0.9;

export const SKY_COLOR = "#e8e4da";
export const FOG_NEAR = 70;
export const FOG_FAR = 380;

export const SUN_POSITION = { x: 15, y: 30, z: 12 };

export const LANTERN_POSITIONS = [
  { x: -HALF_W + 3.4, z: -HALF_D + 3.4 },
  { x: HALF_W - 3.4, z: -HALF_D + 3.4 },
  { x: -HALF_W + 3.4, z: HALF_D - 3.4 },
  { x: HALF_W - 3.4, z: HALF_D - 3.4 },
];
export const LANTERN_POLE_HALF = 0.2;
