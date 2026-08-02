export type GamePhase = "menu" | "playing" | "paused" | "gameover";

export interface Vec3 {
  x: number;
  y: number;
  z: number;
}

export interface InputState {
  pointerActive: boolean;
  pointerPoint: Vec3;
  wasdDir: Vec3;
  boosting: boolean;
}

export interface FoodEntity {
  id: number;
  position: Vec3;
  velocity: Vec3;
  shellActive: boolean;
}

export interface Shard {
  id: number;
  position: Vec3;
  velocity: Vec3;
  radius: number;
  bornAt: number;
  eaten: boolean;
}

export interface BreakInfo {
  position: Vec3;
  at: number;
  shards: number;
}

export interface SnakeState {
  positions: Vec3[];
  heading: Vec3;
  desiredHeading: Vec3;
  speed: number;
  boost: number;
  boosting: boolean;
  invulnUntil: number;
}

export interface WorldState {
  time: number;
  snake: SnakeState;
  foods: FoodEntity[];
  shards: Shard[];
  score: number;
  hp: number;
  activeBreak: { spawned: number; eaten: number } | null;
  foodSpawnTimer: number;
  lastBreak: BreakInfo | null;
  idCounter: number;
}
