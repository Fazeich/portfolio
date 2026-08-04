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
  position: Vec3;
  velocity: Vec3;
}

export interface Shard {
  position: Vec3;
  velocity: Vec3;
  radius: number;
  bornAt: number;
  breakId: number;
  eaten: boolean;
}

export interface BreakTracker {
  id: number;
  remaining: number;
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
  boostCooldown: number;
  invulnUntil: number;
}

export interface WorldState {
  time: number;
  snake: SnakeState;
  foods: FoodEntity[];
  shards: Shard[];
  score: number;
  hp: number;
  activeBreaks: BreakTracker[];
  breakCounter: number;
  foodSpawnTimer: number;
  lastBreak: BreakInfo | null;
}
