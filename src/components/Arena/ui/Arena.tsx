import { Edges, Grid } from "@react-three/drei";
import { useMemo } from "react";
import * as THREE from "three";
import { useTheme } from "styled-components";
import { ARENA_DEPTH, ARENA_HEIGHT, ARENA_WIDTH } from "@/lib/constants";
import { WALL_THICKNESS } from "@/components/Arena/lib/constants";

const HALF_W = ARENA_WIDTH / 2;
const HALF_D = ARENA_DEPTH / 2;
const HALF_H = ARENA_HEIGHT / 2;

const WALLS: Array<{
  position: [number, number, number];
  geometry: "long" | "side";
}> = [
  { position: [0, HALF_H, -HALF_D], geometry: "long" },
  { position: [0, HALF_H, HALF_D], geometry: "long" },
  { position: [-HALF_W, HALF_H, 0], geometry: "side" },
  { position: [HALF_W, HALF_H, 0], geometry: "side" },
];

export const Arena = () => {
  const theme = useTheme();

  const wallGeo = useMemo(
    () => new THREE.BoxGeometry(ARENA_WIDTH, ARENA_HEIGHT, WALL_THICKNESS),
    [],
  );
  const sideGeo = useMemo(
    () => new THREE.BoxGeometry(WALL_THICKNESS, ARENA_HEIGHT, ARENA_DEPTH),
    [],
  );
  const wallMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: theme.arena.wall,
        transparent: true,
        opacity: theme.arena.wallOpacity,
        roughness: 0.6,
        metalness: 0.2,
        side: THREE.DoubleSide,
      }),
    [theme.arena.wall, theme.arena.wallOpacity],
  );

  return (
    <group>
      <Grid
        position={[0, 0, 0]}
        args={[ARENA_WIDTH, ARENA_DEPTH]}
        cellSize={2}
        cellColor={theme.arena.grid}
        sectionSize={10}
        sectionColor={theme.arena.gridSecondary}
        infiniteGrid={false}
        fadeDistance={80}
        fadeStrength={1}
      />

      {WALLS.map((wall, index) => (
        <mesh
          key={index}
          geometry={wall.geometry === "long" ? wallGeo : sideGeo}
          material={wallMaterial}
          position={wall.position}
        >
          <Edges scale={1.001} color={theme.snake.glow} />
        </mesh>
      ))}
    </group>
  );
};
