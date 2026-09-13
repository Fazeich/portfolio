export type BiomeId = "meadow" | "forest" | "rocky" | "mountain";

export interface Biome {
  id: BiomeId;
  label: string;
  low: string;
  high: string;
  ground: string;
  trunk: string;
  leaf: string;
  leafAlt: string;
  rock: string;
  grass: string;
  flower: string;
  treeDensity: number;
  rockDensity: number;
  grassDensity: number;
  flowerDensity: number;
}

export const BIOMES: Record<BiomeId, Biome> = {
  meadow: {
    id: "meadow",
    label: "Луг",
    low: "#79c355",
    high: "#9edb6b",
    ground: "#8fce5f",
    trunk: "#96603a",
    leaf: "#4fae4a",
    leafAlt: "#6cc45a",
    rock: "#b3a58c",
    grass: "#a8e06a",
    flower: "#ffd452",
    treeDensity: 0.22,
    rockDensity: 0.14,
    grassDensity: 0.95,
    flowerDensity: 0.5,
  },
  forest: {
    id: "forest",
    label: "Лес",
    low: "#4f9b45",
    high: "#6fbd54",
    ground: "#5fa84b",
    trunk: "#7f5330",
    leaf: "#2f8a3d",
    leafAlt: "#4fb04c",
    rock: "#9c927e",
    grass: "#7fd05f",
    flower: "#ff9ecb",
    treeDensity: 0.78,
    rockDensity: 0.2,
    grassDensity: 0.75,
    flowerDensity: 0.35,
  },
  rocky: {
    id: "rocky",
    label: "Скалы",
    low: "#b6a377",
    high: "#d3c090",
    ground: "#c4b184",
    trunk: "#8a6a44",
    leaf: "#5f9d4a",
    leafAlt: "#7db457",
    rock: "#9a8f7c",
    grass: "#c9cc7f",
    flower: "#ffcf6e",
    treeDensity: 0.16,
    rockDensity: 0.72,
    grassDensity: 0.4,
    flowerDensity: 0.22,
  },
  mountain: {
    id: "mountain",
    label: "Горы",
    low: "#c3ccd4",
    high: "#f2f6f9",
    ground: "#dbe3ea",
    trunk: "#7d6a58",
    leaf: "#4f8a4e",
    leafAlt: "#6aa25a",
    rock: "#aeb8c2",
    grass: "#b9d6a0",
    flower: "#e7f2ff",
    treeDensity: 0.08,
    rockDensity: 0.65,
    grassDensity: 0.22,
    flowerDensity: 0.12,
  },
};

export const BIOME_IDS: BiomeId[] = ["meadow", "forest", "rocky", "mountain"];
