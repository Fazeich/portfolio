import { GamePhase } from "@/lib/types";

export interface ISnake3DStore {
  phase: GamePhase;
  gameId: number;
  score: number;
  hp: number;
  boost: number;
  best: number;
}
