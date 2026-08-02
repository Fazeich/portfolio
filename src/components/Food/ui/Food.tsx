import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";
import { useTheme } from "styled-components";
import { FOOD_RADIUS, FOOD_SHELL_RADIUS, MAX_FOODS } from "@/lib/constants";
import { WorldState } from "@/lib/types";

export const Food = ({ world }: { world: WorldState }) => {
  const theme = useTheme();
  const shellRefs = useRef<Array<THREE.Mesh | null>>([]);
  const coreRefs = useRef<Array<THREE.Mesh | null>>([]);

  useFrame(({ clock }) => {
    const time = clock.getElapsedTime();

    for (let i = 0; i < MAX_FOODS; i += 1) {
      const shell = shellRefs.current[i];
      const core = coreRefs.current[i];

      if (!shell || !core) {
        continue;
      }

      const food = world.foods[i];

      if (food) {
        shell.visible = true;
        core.visible = true;
        shell.position.set(food.position.x, food.position.y, food.position.z);
        core.position.set(food.position.x, food.position.y, food.position.z);
        shell.rotation.y = time * 0.8 + i;
        core.rotation.y = time * 1.6 + i;
      } else {
        shell.visible = false;
        core.visible = false;
      }
    }
  });

  return (
    <group>
      {Array.from({ length: MAX_FOODS }).map((_, i) => (
        <group key={i}>
          <mesh
            ref={(el) => {
              shellRefs.current[i] = el;
            }}
          >
            <sphereGeometry args={[FOOD_SHELL_RADIUS, 24, 24]} />
            <meshStandardMaterial
              color={theme.food.shell}
              transparent
              opacity={0.35}
              emissive={theme.food.shell}
              emissiveIntensity={0.25}
              roughness={0.2}
              metalness={0.4}
            />
          </mesh>
          <mesh
            ref={(el) => {
              coreRefs.current[i] = el;
            }}
          >
            <sphereGeometry args={[FOOD_RADIUS, 24, 24]} />
            <meshStandardMaterial
              color={theme.food.core}
              emissive={theme.food.core}
              emissiveIntensity={0.7}
              roughness={0.2}
              metalness={0.2}
              toneMapped={false}
            />
          </mesh>
        </group>
      ))}
    </group>
  );
};
