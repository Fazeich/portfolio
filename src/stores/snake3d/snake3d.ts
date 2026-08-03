import { createStore } from "effector";
import {
  addScore,
  damageSnake,
  gameOver,
  pauseGame,
  resumeGame,
  startGame,
  toMenu,
} from "@/stores/snake3d/events";
import { ISnake3DStore } from "@/stores/snake3d/types";

const BEST_KEY = "snake3d-best";

const loadBest = (): number => {
  try {
    const value = Number(localStorage.getItem(BEST_KEY));

    return Number.isFinite(value) ? value : 0;
  } catch {
    return 0;
  }
};

const saveBest = (value: number): void => {
  try {
    localStorage.setItem(BEST_KEY, String(value));
  } catch {
    /* noop */
  }
};

const initialState = (): ISnake3DStore => ({
  phase: "menu",
  gameId: 0,
  score: 0,
  hp: 3,
  best: loadBest(),
});

const updateBest = (state: ISnake3DStore, score: number): number => {
  const best = score > state.best ? score : state.best;

  saveBest(best);

  return best;
};

export const $snake3d = createStore<ISnake3DStore>(initialState())
  .on(startGame, (state) => ({
    ...initialState(),
    phase: "playing",
    gameId: state.gameId + 1,
  }))
  .on(addScore, (state, gained) => {
    const score = state.score + gained;

    return { ...state, score, best: updateBest(state, score) };
  })
  .on(damageSnake, (state) => ({
    ...state,
    hp: Math.max(0, state.hp - 1),
  }))
  .on(pauseGame, (state) => ({ ...state, phase: "paused" }))
  .on(resumeGame, (state) => ({ ...state, phase: "playing" }))
  .on(toMenu, (state) => ({ ...state, phase: "menu" }))
  .on(gameOver, (state) => ({
    ...state,
    phase: "gameover",
    best: updateBest(state, state.score),
  }));
