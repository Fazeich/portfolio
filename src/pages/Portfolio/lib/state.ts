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
    y: number;
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
  hoveredPedestalId: string | null;
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
    y: 0,
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
  hoveredPedestalId: null,
  tooltip: { ...NO_TOOLTIP },
});
