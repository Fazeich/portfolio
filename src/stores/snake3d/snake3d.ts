import { createStore } from "effector";
import {
  addScore,
  damageSnake,
  gameOver,
  pauseGame,
  resumeGame,
  setBoost,
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
  score: 0,
  hp: 3,
  boost: 100,
  best: loadBest(),
});

export const $snake3d = createStore<ISnake3DStore>(initialState())
  .on(startGame, () => ({
    ...initialState(),
    phase: "playing",
  }))
  .on(addScore, (state, gained) => {
    const score = state.score + gained;
    const best = score > state.best ? score : state.best;

    saveBest(best);

    return { ...state, score, best };
  })
  .on(damageSnake, (state) => ({
    ...state,
    hp: Math.max(0, state.hp - 1),
  }))
  .on(setBoost, (state, boost) => ({ ...state, boost }))
  .on(pauseGame, (state) => ({ ...state, phase: "paused" }))
  .on(resumeGame, (state) => ({ ...state, phase: "playing" }))
  .on(toMenu, (state) => ({ ...state, phase: "menu" }))
  .on(gameOver, (state) => {
    const best = state.score > state.best ? state.score : state.best;

    saveBest(best);

    return { ...state, phase: "gameover", best };
  });
