import { createEvent, createStore } from "effector";
import { advanceExpedition, ExpeditionAction, freshExpedition, parseExpedition } from "@/lib/expedition";
import { readAutoloopSeed, isAutoloopEnabled } from "@/lib/autoloop";
const saveKey = `portfolio:expedition:v1:${readAutoloopSeed() || 1337}`;
const readSave = () => {
  try { return isAutoloopEnabled() ? freshExpedition() : parseExpedition(localStorage.getItem(saveKey)); }
  catch { return freshExpedition(); }
};
export const expeditionAction = createEvent<ExpeditionAction>();
export const expeditionNotice = createEvent<string>();
export const $expedition = createStore(readSave()).on(expeditionAction, advanceExpedition);
export const $expeditionNotice = createStore("Сеть маяков погасла. Соберите энергию и верните свет в долину.").on(expeditionNotice, (_, message) => message);
export const $saveAvailable = createStore(true);
const saveFailed = createEvent();
$saveAvailable.on(saveFailed, () => false);
$expedition.watch((save) => {
  if (isAutoloopEnabled()) return;
  try { localStorage.setItem(saveKey, JSON.stringify(save)); } catch { saveFailed(); }
});
