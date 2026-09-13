export interface AutoloopPlayer {
  x: number;
  z: number;
  facing?: number;
}

export interface AutoloopStats {
  fps: number;
  drawCalls: number;
  triangles: number;
}

export interface AutoloopApi {
  freeze(frozen: boolean): void;
  hideHud(hidden: boolean): void;
  setSeed(seed: number): void;
  setPlayer(player: AutoloopPlayer): void;
  stats(): AutoloopStats;
}

export interface AutoloopRuntime {
  enabled: boolean;
  frozen: boolean;
  hudHidden: boolean;
  seed: number;
}

export const autoloopRuntime: AutoloopRuntime = {
  enabled: false,
  frozen: false,
  hudHidden: false,
  seed: 0,
};

export const setAutoloopSeed = (seed: number): void => {
  if (Number.isFinite(seed)) {
    autoloopRuntime.seed = Math.trunc(seed);
  }
};

export const isAutoloopEnabled = (): boolean => {
  if (typeof window === "undefined") {
    return false;
  }

  return new URLSearchParams(window.location.search).get("autoloop") === "1";
};

export const isAutoloopFrozen = (): boolean => autoloopRuntime.frozen;

export const readAutoloopSeed = (): number => {
  if (typeof window === "undefined") {
    return 0;
  }

  const raw = new URLSearchParams(window.location.search).get("seed");

  const seed = raw ? Number.parseInt(raw, 10) : 0;

  return Number.isFinite(seed) ? seed : 0;
};

declare global {
  interface Window {
    __autoloop?: AutoloopApi;
  }
}
