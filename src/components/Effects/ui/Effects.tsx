import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { ARENA_DEPTH, ARENA_WIDTH } from "@/lib/constants";
import { WorldState } from "@/lib/types";
import {
  createParticleTexture,
  updateParticles,
} from "@/components/Effects/lib/particles";
import {
  MAX_PARTICLES,
  PARTICLE_SIZE,
} from "@/components/Effects/lib/constants";

const DUST_COUNT = 220;

export const Effects = ({ world }: { world: WorldState }) => {
  const particlesRef = useRef<THREE.Points>(null);
  const dustRef = useRef<THREE.Points>(null);

  const particleGeometry = useMemo(() => {
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute(
      "position",
      new THREE.BufferAttribute(new Float32Array(MAX_PARTICLES * 3), 3),
    );
    geometry.setAttribute(
      "color",
      new THREE.BufferAttribute(new Float32Array(MAX_PARTICLES * 3), 3),
    );

    return geometry;
  }, []);

  const dustGeometry = useMemo(() => {
    const positions = new Float32Array(DUST_COUNT * 3);

    for (let i = 0; i < DUST_COUNT; i += 1) {
      positions[i * 3] = (Math.random() * 2 - 1) * (ARENA_WIDTH / 2);
      positions[i * 3 + 1] = Math.random() * 22 + 1;
      positions[i * 3 + 2] = (Math.random() * 2 - 1) * (ARENA_DEPTH / 2);
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute(
      "position",
      new THREE.BufferAttribute(positions, 3),
    );

    return geometry;
  }, []);

  const particleTexture = useMemo(() => createParticleTexture(), []);

  useFrame((_, delta) => {
    if (particlesRef.current) {
      updateParticles(world, delta, particleGeometry);
    }

    if (dustRef.current) {
      dustRef.current.rotation.y += delta * 0.01;
    }
  });

  return (
    <group>
      <points ref={dustRef} geometry={dustGeometry}>
        <pointsMaterial
          size={0.25}
          color="#4b6c9e"
          transparent
          opacity={0.35}
          depthWrite={false}
          sizeAttenuation
        />
      </points>

      <points ref={particlesRef} geometry={particleGeometry} frustumCulled={false}>
        <pointsMaterial
          size={PARTICLE_SIZE}
          map={particleTexture}
          vertexColors
          transparent
          opacity={0.9}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          sizeAttenuation
        />
      </points>
    </group>
  );
};
