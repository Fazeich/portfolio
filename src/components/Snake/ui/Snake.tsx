import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";
import { useTheme } from "styled-components";
import { MAX_SEGMENTS, SEGMENT_RADIUS, SEGMENT_SPACING } from "@/lib/constants";
import { WorldState } from "@/lib/types";
import { syncSnakeMesh } from "@/components/Snake/lib/render";

export const Snake = ({ world }: { world: WorldState }) => {
  const theme = useTheme();
  const meshRef = useRef<THREE.InstancedMesh>(null);

  useFrame(() => {
    if (!meshRef.current) {
      return;
    }

    syncSnakeMesh(meshRef.current, world, {
      head: theme.snake.head,
      body: theme.snake.body,
      tail: theme.snake.tail,
    });
  });

  return (
    <instancedMesh
      ref={meshRef}
      args={[undefined, undefined, MAX_SEGMENTS]}
      frustumCulled={false}
    >
      <capsuleGeometry args={[SEGMENT_RADIUS, SEGMENT_SPACING, 4, 10]} />
      <meshStandardMaterial
        color="#ffffff"
        emissive={theme.snake.glow}
        emissiveIntensity={0.35}
        roughness={0.3}
        metalness={0.1}
        toneMapped={false}
      />
    </instancedMesh>
  );
};
