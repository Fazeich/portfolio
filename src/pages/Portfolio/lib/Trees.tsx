import { useMemo } from "react";
import * as THREE from "three";
import { readAutoloopSeed } from "@/lib/autoloop";
import { seeded } from "@/lib/random";
import { HALF_D, HALF_W } from "./constants";

const trunkMaterial = new THREE.MeshStandardMaterial({
  color: "#7a6248",
  roughness: 0.9,
  metalness: 0,
});

const leafMaterial = new THREE.MeshStandardMaterial({
  color: "#5d7a52",
  roughness: 1,
  metalness: 0,
});

interface Tree {
  position: [number, number, number];
  height: number;
  crown: number;
  lean: number;
}

const generateTrees = (count: number, seed: number): Tree[] => {
  const trees: Tree[] = [];

  for (let i = 0; i < count; i += 1) {
    const r1 = seeded(i * 13 + 1, seed);
    const r2 = seeded(i * 13 + 2, seed);
    const r3 = seeded(i * 13 + 3, seed);
    const edge = i % 4;
    const offset = 2.5 + r1 * 6;

    let x: number;
    let z: number;

    if (edge === 0) {
      x = (r2 * 2 - 1) * (HALF_W + 5);
      z = -HALF_D - offset;
    } else if (edge === 1) {
      x = (r2 * 2 - 1) * (HALF_W + 5);
      z = HALF_D + offset;
    } else if (edge === 2) {
      x = -HALF_W - offset;
      z = (r2 * 2 - 1) * (HALF_D + 5);
    } else {
      x = HALF_W + offset;
      z = (r2 * 2 - 1) * (HALF_D + 5);
    }

    trees.push({
      position: [x, 0, z],
      height: 1.4 + r1 * 1.2,
      crown: 1.2 + r2 * 1.2,
      lean: (r3 - 0.5) * 0.35,
    });
  }

  return trees;
};

export const Trees = () => {
  const seed = readAutoloopSeed();
  const trees = useMemo(() => generateTrees(10, seed), [seed]);

  return (
    <group>
      {trees.map((tree, i) => (
        <group key={i} position={tree.position} rotation={[0, 0, tree.lean]}>
          <mesh material={trunkMaterial} position={[0, tree.height / 2, 0]} castShadow>
            <cylinderGeometry args={[0.12, 0.18, tree.height, 6]} />
          </mesh>
          <mesh
            material={leafMaterial}
            position={[0, tree.height + tree.crown * 0.35, 0]}
            scale={tree.crown}
            castShadow
          >
            <icosahedronGeometry args={[1, 0]} />
          </mesh>
        </group>
      ))}
    </group>
  );
};
