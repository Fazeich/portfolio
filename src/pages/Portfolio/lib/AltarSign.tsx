import { Billboard, Center, Text3D } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";
import { AltarDef } from "./constants";
import fontUrl from "@/lib/assets/fonts/helvetiker_bold.typeface.json?url";

const altarMaterial = {
  color: "#6b655c",
  roughness: 0.9,
};

const textMaterial = {
  color: "#FED6BC",
  metalness: 0.3,
  roughness: 0.4,
};

export const AltarSign = ({
  altar,
  active,
}: {
  altar: AltarDef;
  active: boolean;
}) => {
  const ringRef = useRef<THREE.Mesh>(null);
  const lightRef = useRef<THREE.PointLight>(null);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();

    if (active) {
      const pulse = 0.5 + 0.5 * Math.sin(t * 3);

      if (ringRef.current) {
        ringRef.current.scale.setScalar(1 + pulse * 0.4);
        (ringRef.current.material as THREE.MeshBasicMaterial).opacity =
          0.35 + pulse * 0.3;
      }

      if (lightRef.current) {
        lightRef.current.intensity = 1.4 + pulse * 0.8;
      }
    } else {
      if (ringRef.current) {
        ringRef.current.scale.setScalar(0.01);
        (ringRef.current.material as THREE.MeshBasicMaterial).opacity = 0;
      }

      if (lightRef.current) {
        lightRef.current.intensity = 0;
      }
    }
  });

  return (
    <group position={[altar.position.x, 0, altar.position.z]}>
      <mesh position={[0, 0.2, 0]} castShadow receiveShadow>
        <boxGeometry args={[2.2, 0.4, 1.6]} />
        <meshStandardMaterial {...altarMaterial} />
      </mesh>

      <mesh position={[0, 0.9, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.8, 1, 1.2]} />
        <meshStandardMaterial {...altarMaterial} />
      </mesh>

      <mesh position={[0, 1.55, 0]} castShadow receiveShadow>
        <boxGeometry args={[2.4, 0.3, 1.8]} />
        <meshStandardMaterial {...altarMaterial} />
      </mesh>

      <Billboard position={[0, 3, 0]}>
        <Center>
          <Text3D
            font={fontUrl}
            size={1.2}
            height={0.28}
            bevelEnabled
            bevelThickness={0.02}
            bevelSize={0.02}
            bevelSegments={2}
            curveSegments={6}
            letterSpacing={0.02}
          >
            {altar.text}
            <meshStandardMaterial {...textMaterial} />
          </Text3D>
        </Center>
      </Billboard>

      <mesh
        ref={ringRef}
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0.02, 0]}
        scale={0.01}
      >
        <ringGeometry args={[1.5, 1.85, 48]} />
        <meshBasicMaterial
          color={altar.accent}
          transparent
          opacity={0}
          depthWrite={false}
        />
      </mesh>

      <pointLight
        ref={lightRef}
        position={[0, 3.2, 0]}
        intensity={0}
        distance={9}
        color={altar.accent}
      />
    </group>
  );
};
