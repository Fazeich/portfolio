import { BiomeId } from "./biomes";
import { Ramp } from "./ramps";
import { Terrain } from "./terrain";

export type PropKind = "tree" | "rock" | "grass" | "flower" | "crate";

export interface Prop {
  kind: PropKind;
  x: number;
  y: number;
  z: number;
  rotation: number;
  scale: number;
  variant: number;
  biome: BiomeId;
}

export interface Chunk {
  cx: number;
  cz: number;
  biome: BiomeId;
  props: Prop[];
  ramps: Ramp[];
}

export interface Collider {
  x: number;
  z: number;
  radius: number;
}

export interface PedestalDef {
  id: string;
  position: { x: number; z: number };
  target: string;
  label: string;
  keyHint: string;
  accent: string;
  halfW: number;
  halfD: number;
  height: number;
}

export interface World {
  seed: number;
  terrain: Terrain;
  chunks: Chunk[];
  props: Prop[];
  ramps: Ramp[];
  pedestals: PedestalDef[];
  colliders: Collider[];
}
