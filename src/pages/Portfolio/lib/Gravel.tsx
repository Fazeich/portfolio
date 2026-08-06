import { useLayoutEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { ALTARS, HALF_D, HALF_W } from "./constants";

const COUNT = 900;
const INTERIOR_MARGIN = 1;
const CLEAR_RADIUS = 3.2;

const gravelColors = ["#c9c2b8", "#b8b0a4", "#a89f92", "#bfb7ab"];

const seeded = (n: number): number => {
  const x = Math.sin(n * 127.1 + 311.7) * 43758.5453;

  return x - Math.floor(x);
};

interface Pebble {
  position: [number, number, number];
  rotation: [number, number, number];
  scale: number;
  color: string;
}

const generatePebbles = (): Pebble[] => {
  const pebbles: Pebble[] = [];
  let seed = 0;

  while (pebbles.length < COUNT && seed < COUNT * 50) {
    const r1 = seeded(seed * 3 + 1);
    const r2 = seeded(seed * 3 + 2);
    const r3 = seeded(seed * 3 + 3);
    seed += 1;

    const minX = -HALF_W + INTERIOR_MARGIN;
    const maxX = HALF_W - INTERIOR_MARGIN;
    const minZ = -HALF_D + INTERIOR_MARGIN;
    const maxZ = HALF_D - INTERIOR_MARGIN;

    const x = minX + r1 * (maxX - minX);
    const z = minZ + r2 * (maxZ - minZ);

    let clear = false;

    for (const altar of ALTARS) {
      const dx = x - altar.position.x;
      const dz = z - altar.position.z;

      if (Math.sqrt(dx * dx + dz * dz) < CLEAR_RADIUS) {
        clear = true;
        break;
      }
    }

    if (clear) {
      continue;
    }

    const size = 0.03 + r3 * 0.08;

    pebbles.push({
      position: [x, size * 0.4, z],
      rotation: [r2 * Math.PI * 2, r1 * Math.PI * 2, r3 * Math.PI * 2],
      scale: size,
      color: gravelColors[pebbles.length % gravelColors.length],
    });
  }

  return pebbles;
};

export const Gravel = () => {
  const ref = useRef<THREE.InstancedMesh>(null);

  const pebbles = useMemo(() => generatePebbles(), []);

  useLayoutEffect(() => {
    const mesh = ref.current;
    const color = new THREE.Color();

    if (!mesh) {
      return;
    }

    for (let i = 0; i < pebbles.length; i += 1) {
      const p = pebbles[i];

      const dummy = new THREE.Object3D();
      dummy.position.set(...p.position);
      dummy.rotation.set(...p.rotation);
      dummy.scale.setScalar(p.scale);
      dummy.updateMatrix();

      mesh.setMatrixAt(i, dummy.matrix);
      mesh.setColorAt(i, color.set(p.color));
    }

    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) {
      mesh.instanceColor.needsUpdate = true;
    }
  }, [pebbles]);

  const material = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        roughness: 0.95,
        metalness: 0,
      }),
    [],
  );

  return (
    <instancedMesh
      ref={ref}
      args={[undefined, undefined, COUNT]}
      material={material}
      castShadow
      receiveShadow
    >
      <dodecahedronGeometry args={[1, 0]} />
    </instancedMesh>
  );
};
