import { createEvent, createStore } from "effector";
import { IMainStore } from "./types";

export const $main = createStore<IMainStore>({
  isVisibleHeader: false,
});

export const changeMain = createEvent<IMainStore>();

$main.on(changeMain, (state, payload) => {
  return {
    ...state,
    ...payload,
  };
});
