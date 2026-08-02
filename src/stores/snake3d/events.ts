import { createEvent } from "effector";

export const startGame = createEvent();
export const gameOver = createEvent();
export const toMenu = createEvent();
export const pauseGame = createEvent();
export const resumeGame = createEvent();
export const addScore = createEvent<number>();
export const damageSnake = createEvent();
export const setBoost = createEvent<number>();
