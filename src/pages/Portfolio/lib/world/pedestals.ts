import { chance, createRng } from "@/lib/random";
import { expeditionClearing } from "@/lib/expedition";
import { CHUNK_SIZE } from "../constants";
import { PedestalDef } from "./types";

export const PEDESTAL_CHANCE = 0.01;

interface MiniGame {
  target: string;
  label: string;
  accent: string;
}

const MINI_GAMES: MiniGame[] = [
  { target: "/snake", label: "Snake 3D", accent: "#22c55e" },
  { target: "/letters", label: "Letter Rain", accent: "#f59e0b" },
];

const START_PEDESTALS: Array<{ x: number; z: number; game: MiniGame }> = [
  { x: -16, z: -9, game: MINI_GAMES[0] },
  { x: 16, z: -9, game: MINI_GAMES[1] },
];

const makePedestal = (
  id: string,
  x: number,
  z: number,
  game: MiniGame,
): PedestalDef => ({
  id,
  position: { x, z },
  target: game.target,
  label: game.label,
  keyHint: "E / У",
  accent: game.accent,
  halfW: 1.3,
  halfD: 1,
  height: 3.9,
});

export const createStartPedestals = (): PedestalDef[] =>
  START_PEDESTALS.map((entry, index) =>
    makePedestal(`start-${index}`, entry.x, entry.z, entry.game),
  );

export const createPedestalForChunk = (
  seed: number,
  cx: number,
  cz: number,
): PedestalDef | null => {
  const rng = createRng(
    (seed ^ (cx * 92821 + cz * 68917 + 0x9e3779b9)) >>> 0,
  );

  if (!chance(rng, PEDESTAL_CHANCE)) {
    return null;
  }

  const originX = cx * CHUNK_SIZE;
  const originZ = cz * CHUNK_SIZE;
  const game = MINI_GAMES[Math.floor(rng() * MINI_GAMES.length)];
  const x = originX + rng() * CHUNK_SIZE;
  const z = originZ + rng() * CHUNK_SIZE;
  if (expeditionClearing(x, z)) return null;

  return makePedestal(
    `wild-${cx}-${cz}`,
    x,
    z,
    game,
  );
};

export const createPedestals = (seed: number): PedestalDef[] => {
  const pedestals = createStartPedestals();

  for (let cz = -2; cz < 2; cz += 1) {
    for (let cx = -3; cx < 3; cx += 1) {
      const pedestal = createPedestalForChunk(seed, cx, cz);

      if (pedestal) {
        pedestals.push(pedestal);
      }
    }
  }

  return pedestals;
};
