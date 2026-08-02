import { GamePhase } from "@/lib/types";

export interface ISnake3DStore {
  phase: GamePhase;
  score: number;
  hp: number;
  boost: number;
  best: number;
}
