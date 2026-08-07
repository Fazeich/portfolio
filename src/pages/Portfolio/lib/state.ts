import { PLAYER_SPAWN } from "./constants";

export type CharacterId = "mage" | "car";

export interface TooltipState {
  visible: boolean;
  x: number;
  y: number;
  label: string;
  keyHint: string;
  target: string;
}

export interface TownState {
  player: {
    x: number;
    z: number;
    facing: number;
    walkPhase: number;
    targetWalkPhase: number;
    moving: boolean;
  };
  interacting: boolean;
  interactionTimer: number;
  interactionTarget: string;
  hoveredAltarId: string | null;
  tooltip: TooltipState;
}

export const NO_TOOLTIP: TooltipState = {
  visible: false,
  x: 0,
  y: 0,
  label: "",
  keyHint: "E",
  target: "",
};

export const createTownState = (): TownState => ({
  player: {
    x: PLAYER_SPAWN.x,
    z: PLAYER_SPAWN.z,
    facing: Math.PI,
    walkPhase: 0,
    targetWalkPhase: 0,
    moving: false,
  },
  interacting: false,
  interactionTimer: 0,
  interactionTarget: "",
  hoveredAltarId: null,
  tooltip: { ...NO_TOOLTIP },
});
