export interface IArenaTheme {
  background: string;
  wall: string;
  wallOpacity: number;
  grid: string;
  gridSecondary: string;
}

export interface ISnakeTheme {
  head: string;
  body: string;
  tail: string;
  glow: string;
}

export interface IFoodTheme {
  shell: string;
  core: string;
  shard: string;
}

export interface IUITheme {
  text: string;
  textMuted: string;
  accent: string;
  danger: string;
  boost: string;
  panel: string;
  panelBorder: string;
  overlay: string;
}

export interface ITheme {
  arena: IArenaTheme;
  snake: ISnakeTheme;
  food: IFoodTheme;
  ui: IUITheme;
}

export const GAME_THEME: ITheme = {
  arena: {
    background: "#0a0e17",
    wall: "#1b2a4a",
    wallOpacity: 0.45,
    grid: "#1c2a44",
    gridSecondary: "#14203a",
  },
  snake: {
    head: "#4ade80",
    body: "#22c55e",
    tail: "#15803d",
    glow: "#86efac",
  },
  food: {
    shell: "#38bdf8",
    core: "#7dd3fc",
    shard: "#fbbf24",
  },
  ui: {
    text: "#e2e8f0",
    textMuted: "#94a3b8",
    accent: "#22c55e",
    danger: "#ef4444",
    boost: "#38bdf8",
    panel: "rgba(10, 14, 23, 0.85)",
    panelBorder: "rgba(56, 189, 248, 0.35)",
    overlay: "rgba(4, 6, 12, 0.7)",
  },
};
