import { createEvent, createStore } from "effector";
import { IMainStore } from "./types";

export const $main = createStore<IMainStore>({
  isVisibleHeader: true,
});

export const changeMain = createEvent<IMainStore>();

$main.on(changeMain, (state, payload) => {
  return {
    ...state,
    ...payload,
  };
});
