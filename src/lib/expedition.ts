export const BEACON_COST = 3;
export const CAMP = { x: -3, z: 0, name: "Лагерь" };
export const BEACONS = [
  { id: "dawn", name: "Рассвет", x: 18, z: -22, color: "#ffc76b" },
  { id: "grove", name: "Тихая роща", x: -42, z: -48, color: "#8aebbc" },
  { id: "ridge", name: "Дальний хребет", x: 64, z: -78, color: "#a9c5ff" },
  { id: "echo", name: "Долина эха", x: -78, z: 38, color: "#e4b4ff" },
  { id: "sunset", name: "Закатный берег", x: 62, z: 64, color: "#ffab91" },
];
export const CRYSTALS = BEACONS.flatMap((beacon) =>
  [0, 1, 2, 3].map((index) => ({ id: `${beacon.id}-${index}`, x: beacon.x + Math.cos(index * Math.PI / 2) * 7, z: beacon.z + Math.sin(index * Math.PI / 2) * 7 })),
);
const clearings = [...BEACONS, ...CRYSTALS, CAMP, { x: 0, z: 0 }];
export const expeditionClearing = (x: number, z: number) => clearings.some((point) => Math.hypot(point.x - x, point.z - z) < 4);
export interface Expedition { collected: string[]; restored: string[]; discovered: string[]; completed: boolean }
export const freshExpedition = (): Expedition => ({ collected: [], restored: [], discovered: [], completed: false });
export const energyLeft = (save: Expedition) => save.collected.length - save.restored.length * BEACON_COST;
export type ExpeditionAction = { type: "collect" | "discover" | "restore"; id: string } | { type: "complete" };
export const advanceExpedition = (save: Expedition, action: ExpeditionAction): Expedition => {
  if (action.type === "complete") return save.restored.length === BEACONS.length && !save.completed ? { ...save, completed: true } : save;
  const { id, type } = action;
  if (type === "collect") return CRYSTALS.some((item) => item.id === id) && !save.collected.includes(id) ? { ...save, collected: [...save.collected, id] } : save;
  if (!BEACONS.some((item) => item.id === id)) return save;
  if (type === "discover") return save.discovered.includes(id) ? save : { ...save, discovered: [...save.discovered, id] };
  return !save.restored.includes(id) && save.discovered.includes(id) && energyLeft(save) >= BEACON_COST ? { ...save, restored: [...save.restored, id] } : save;
};
export const parseExpedition = (raw: string | null): Expedition => {
  try {
    const value = JSON.parse(raw ?? "null");
    if (!value || !Array.isArray(value.collected) || !Array.isArray(value.restored) || !Array.isArray(value.discovered)) return freshExpedition();
    let save = freshExpedition();
    for (const id of value.collected) save = advanceExpedition(save, { type: "collect", id });
    for (const id of value.discovered) save = advanceExpedition(save, { type: "discover", id });
    for (const id of value.restored) save = advanceExpedition(save, { type: "restore", id });
    if (value.completed === true) save = advanceExpedition(save, { type: "complete" });
    return save;
  } catch { return freshExpedition(); }
};
