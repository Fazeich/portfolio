import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";
import { useTheme } from "styled-components";
import { MAX_SHARDS, SHARD_INERT_TIME, SHARD_RADIUS } from "@/lib/constants";
import { WorldState } from "@/lib/types";

const INERT_COLOR = "#64748b";
const EDIBLE_INTENSITY = 0.9;
const INERT_INTENSITY = 0.1;

export const Shards = ({ world }: { world: WorldState }) => {
  const theme = useTheme();
  const meshRefs = useRef<Array<THREE.Mesh | null>>([]);
  const materialRefs = useRef<Array<THREE.MeshStandardMaterial | null>>([]);

  useFrame(({ clock }) => {
    const time = clock.getElapsedTime();

    for (let i = 0; i < MAX_SHARDS; i += 1) {
      const mesh = meshRefs.current[i];
      const material = materialRefs.current[i];

      if (!mesh || !material) {
        continue;
      }

      const shard = world.shards[i];

      if (shard) {
        mesh.visible = true;
        mesh.position.set(shard.position.x, shard.position.y, shard.position.z);
        mesh.rotation.x = time * 2 + i;
        mesh.rotation.y = time * 1.4 + i * 2;

        const inert = world.time - shard.bornAt < SHARD_INERT_TIME;

        material.color.set(inert ? INERT_COLOR : theme.food.shard);
        material.emissive.set(inert ? INERT_COLOR : theme.food.shard);
        material.emissiveIntensity = inert ? INERT_INTENSITY : EDIBLE_INTENSITY;
        material.opacity = inert ? 0.4 : 1;
      } else {
        mesh.visible = false;
      }
    }
  });

  return (
    <group>
      {Array.from({ length: MAX_SHARDS }).map((_, i) => (
        <mesh
          key={i}
          ref={(el) => {
            meshRefs.current[i] = el;
          }}
        >
          <octahedronGeometry args={[SHARD_RADIUS, 0]} />
          <meshStandardMaterial
            ref={(el) => {
              materialRefs.current[i] = el;
            }}
            color={theme.food.shard}
            emissive={theme.food.shard}
            emissiveIntensity={EDIBLE_INTENSITY}
            transparent
            roughness={0.2}
            metalness={0.3}
            toneMapped={false}
          />
        </mesh>
      ))}
    </group>
  );
};
