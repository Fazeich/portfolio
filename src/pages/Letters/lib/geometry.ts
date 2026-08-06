import * as THREE from "three";
import { Font, FontLoader } from "three/examples/jsm/loaders/FontLoader.js";
import type { FontData } from "three/examples/jsm/loaders/FontLoader.js";
import { TextGeometry } from "three/examples/jsm/geometries/TextGeometry.js";
import fontJson from "@/lib/assets/fonts/helvetiker_bold.typeface.json";

interface LetterBox {
  w: number;
  h: number;
  d: number;
}

let font: Font | null = null;
const geometryCache = new Map<string, THREE.BufferGeometry>();
const boxCache = new Map<string, LetterBox>();

const getFont = (): Font => {
  if (!font) {
    font = new FontLoader().parse(fontJson as FontData);
  }

  return font;
};

export const getLetterGeometry = (char: string): THREE.BufferGeometry => {
  let geometry = geometryCache.get(char);

  if (!geometry) {
    geometry = new TextGeometry(char, {
      font: getFont(),
      size: 1,
      depth: 0.24,
      bevelEnabled: true,
      bevelThickness: 0.02,
      bevelSize: 0.02,
      bevelSegments: 2,
      curveSegments: 6,
    });
    geometry.center();
    geometry.computeBoundingBox();
    geometryCache.set(char, geometry);
  }

  return geometry;
};

export const getLetterBox = (char: string): LetterBox => {
  let box = boxCache.get(char);

  if (!box) {
    const bb = getLetterGeometry(char).boundingBox;

    box = {
      w: bb ? Math.max(bb.max.x - bb.min.x, 0.05) : 1,
      h: bb ? Math.max(bb.max.y - bb.min.y, 0.05) : 1,
      d: bb ? Math.max(bb.max.z - bb.min.z, 0.05) : 0.24,
    };
    boxCache.set(char, box);
  }

  return box;
};
