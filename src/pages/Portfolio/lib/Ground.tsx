import { useMemo } from "react";
import * as THREE from "three";
import { readAutoloopSeed } from "@/lib/autoloop";
import { seeded } from "@/lib/random";
import { GROUND_EXTENT } from "./constants";

const makeGroundTexture = (seed: number): THREE.Texture => {
  const size = 256;
  const canvas = document.createElement("canvas");

  canvas.width = size;
  canvas.height = size;

  const ctx = canvas.getContext("2d");

  if (ctx) {
    ctx.fillStyle = "#f5efe8";
    ctx.fillRect(0, 0, size, size);

    for (let i = 0; i < 6000; i += 1) {
      const alpha = seeded(i * 3 + 1, seed) * 0.06;
      const shade = seeded(i * 3 + 2, seed) > 0.5 ? "180,172,158" : "210,203,188";

      ctx.fillStyle = `rgba(${shade},${alpha})`;
      ctx.fillRect(
        seeded(i * 3 + 3, seed) * size,
        seeded(i * 3 + 4, seed) * size,
        2,
        2,
      );
    }
  }

  const texture = new THREE.CanvasTexture(canvas);

  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(60, 60);
  texture.colorSpace = THREE.SRGBColorSpace;

  return texture;
};

export const Ground = () => {
  const seed = readAutoloopSeed();
  const material = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
         map: makeGroundTexture(seed),
        color: new THREE.Color("#f2ebe5"),
        roughness: 0.55,
        metalness: 0,
        clearcoat: 0.35,
        clearcoatRoughness: 0.45,
      }),
    [seed],
  );

  return (
    <mesh
      rotation={[-Math.PI / 2, 0, 0]}
      receiveShadow
      material={material}
    >
      <planeGeometry args={[GROUND_EXTENT, GROUND_EXTENT]} />
    </mesh>
  );
};
