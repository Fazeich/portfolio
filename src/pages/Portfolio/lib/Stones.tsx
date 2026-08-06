import { useMemo } from "react";
import * as THREE from "three";
import { HALF_D, HALF_W } from "./constants";

const stoneMaterial = new THREE.MeshStandardMaterial({
  color: new THREE.Color("#8a857e"),
  roughness: 0.95,
  metalness: 0,
});

interface Stone {
  position: [number, number, number];
  scale: [number, number, number];
  rotation: [number, number, number];
}

const seeded = (n: number): number => {
  const x = Math.sin(n * 127.1 + 311.7) * 43758.5453;

  return x - Math.floor(x);
};

const generateStones = (count: number): Stone[] => {
  const stones: Stone[] = [];

  for (let i = 0; i < count; i += 1) {
    const r1 = seeded(i * 3 + 1);
    const r2 = seeded(i * 3 + 2);
    const r3 = seeded(i * 3 + 3);

    const edge = i % 4;
    const offset = 1.5 + r1 * 5.5;

    let x: number;
    let z: number;

    if (edge === 0) {
      x = (r2 * 2 - 1) * (HALF_W + 6);
      z = -HALF_D - offset;
    } else if (edge === 1) {
      x = (r2 * 2 - 1) * (HALF_W + 6);
      z = HALF_D + offset;
    } else if (edge === 2) {
      x = -HALF_W - offset;
      z = (r2 * 2 - 1) * (HALF_D + 6);
    } else {
      x = HALF_W + offset;
      z = (r2 * 2 - 1) * (HALF_D + 6);
    }

    const size = 0.4 + r3 * 1.6;

    stones.push({
      position: [x, size * 0.35, z],
      scale: [size, size * (0.7 + r1 * 0.5), size * (0.8 + r2 * 0.4)],
      rotation: [r2 * Math.PI * 2, r1 * Math.PI * 2, r3 * Math.PI],
    });
  }

  return stones;
};

export const Stones = () => {
  const stones = useMemo(() => generateStones(48), []);

  return (
    <group>
      {stones.map((s, i) => (
        <mesh
          key={i}
          material={stoneMaterial}
          position={s.position}
          scale={s.scale}
          rotation={s.rotation}
          castShadow
          receiveShadow
        >
          <icosahedronGeometry args={[1, 0]} />
        </mesh>
      ))}
    </group>
  );
};
