import { useMemo } from "react";
import * as THREE from "three";

const hillMaterial = new THREE.MeshStandardMaterial({
  color: "#b9b2a5",
  roughness: 1,
  metalness: 0,
});

const seeded = (n: number): number => {
  const x = Math.sin(n * 127.1 + 311.7) * 43758.5453;

  return x - Math.floor(x);
};

interface Hill {
  position: [number, number, number];
  scale: [number, number, number];
  rotation: [number, number, number];
}

const generateHills = (count: number): Hill[] => {
  const hills: Hill[] = [];

  for (let i = 0; i < count; i += 1) {
    const r1 = seeded(i * 7 + 1);
    const r2 = seeded(i * 7 + 2);
    const r3 = seeded(i * 7 + 3);
    const angle = (i / count) * Math.PI * 2 + r1 * 0.5;
    const radius = 118 + r2 * 44;

    const width = 16 + r1 * 24;
    const height = 6 + r3 * 13;
    const depth = 16 + r2 * 24;

    hills.push({
      position: [Math.cos(angle) * radius, height * 0.28 - 2.5, Math.sin(angle) * radius],
      scale: [width, height, depth],
      rotation: [r3 * 0.4, r1 * Math.PI * 2, r2 * 0.3],
    });
  }

  return hills;
};

export const Hills = () => {
  const hills = useMemo(() => generateHills(26), []);

  return (
    <group>
      {hills.map((hill, i) => (
        <mesh
          key={i}
          material={hillMaterial}
          position={hill.position}
          scale={hill.scale}
          rotation={hill.rotation}
        >
          <icosahedronGeometry args={[1, 0]} />
        </mesh>
      ))}
    </group>
  );
};
