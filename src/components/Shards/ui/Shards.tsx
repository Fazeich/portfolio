import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";
import { useTheme } from "styled-components";
import { MAX_SHARDS, SHARD_INERT_TIME, SHARD_RADIUS } from "@/lib/constants";
import { WorldState } from "@/lib/types";

const INERT_COLOR = "#64748b";
const EDIBLE_INTENSITY = 0.9;
const dummy = new THREE.Object3D();
const color = new THREE.Color();

export const Shards = ({ world }: { world: WorldState }) => {
  const theme = useTheme();
  const meshRef = useRef<THREE.InstancedMesh>(null);

  useFrame(({ clock }) => {
    const mesh = meshRef.current;

    if (!mesh) {
      return;
    }

    const time = clock.getElapsedTime();

    for (let i = 0; i < MAX_SHARDS; i += 1) {
      const shard = world.shards[i];

      if (shard) {
        dummy.position.set(shard.position.x, shard.position.y, shard.position.z);
        dummy.rotation.set(time * 2 + i, time * 1.4 + i * 2, 0);
        dummy.scale.setScalar(1);
        dummy.updateMatrix();
        mesh.setMatrixAt(i, dummy.matrix);

        const inert = world.time - shard.bornAt < SHARD_INERT_TIME;

        color.set(inert ? INERT_COLOR : theme.food.shard);
        mesh.setColorAt(i, color);
      } else {
        dummy.scale.setScalar(0);
        dummy.updateMatrix();
        mesh.setMatrixAt(i, dummy.matrix);
      }
    }

    mesh.instanceMatrix.needsUpdate = true;

    if (mesh.instanceColor) {
      mesh.instanceColor.needsUpdate = true;
    }
  });

  return (
    <instancedMesh
      ref={meshRef}
      args={[undefined, undefined, MAX_SHARDS]}
      frustumCulled={false}
    >
      <octahedronGeometry args={[SHARD_RADIUS, 0]} />
      <meshStandardMaterial
        color="#ffffff"
        emissive={theme.food.shard}
        emissiveIntensity={EDIBLE_INTENSITY}
        roughness={0.2}
        metalness={0.3}
        toneMapped={false}
      />
    </instancedMesh>
  );
};
