import * as THREE from "three";
import {
  HALF_D,
  HALF_W,
  ROOM_DEPTH,
  ROOM_WIDTH,
  WALL_HEIGHT,
  WALL_SIZE,
} from "./constants";

const wallMaterial = new THREE.MeshPhysicalMaterial({
  color: new THREE.Color("#e2d9cd"),
  roughness: 0.35,
  metalness: 0,
  clearcoat: 0.4,
  clearcoatRoughness: 0.4,
});

export const Walls = () => (
  <group>
    <mesh
      material={wallMaterial}
      position={[0, WALL_HEIGHT / 2, -HALF_D]}
      castShadow
      receiveShadow
    >
      <boxGeometry args={[ROOM_WIDTH, WALL_HEIGHT, WALL_SIZE]} />
    </mesh>

    <mesh
      material={wallMaterial}
      position={[0, WALL_HEIGHT / 2, HALF_D]}
      castShadow
      receiveShadow
    >
      <boxGeometry args={[ROOM_WIDTH, WALL_HEIGHT, WALL_SIZE]} />
    </mesh>

    <mesh
      material={wallMaterial}
      position={[-HALF_W, WALL_HEIGHT / 2, 0]}
      castShadow
      receiveShadow
    >
      <boxGeometry args={[WALL_SIZE, WALL_HEIGHT, ROOM_DEPTH]} />
    </mesh>

    <mesh
      material={wallMaterial}
      position={[HALF_W, WALL_HEIGHT / 2, 0]}
      castShadow
      receiveShadow
    >
      <boxGeometry args={[WALL_SIZE, WALL_HEIGHT, ROOM_DEPTH]} />
    </mesh>
  </group>
);
