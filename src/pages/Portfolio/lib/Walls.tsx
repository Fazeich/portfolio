import { useMemo } from "react";
import * as THREE from "three";
import { HALF_D, HALF_W, ROOM_DEPTH, ROOM_WIDTH } from "./constants";

const POST_HEIGHT = 1.15;
const POST_SIZE = 0.16;
const POST_SPACING = 4.4;
const RAIL_SIZE = 0.09;
const RAIL_Y = [1.0, 0.52];

const fenceMaterial = new THREE.MeshStandardMaterial({
  color: "#a9835c",
  roughness: 0.85,
  metalness: 0,
});

interface Post {
  position: [number, number, number];
}

const buildPosts = (): Post[] => {
  const posts: Post[] = [];

  for (let x = -HALF_W + 2.2; x <= HALF_W - 2.2; x += POST_SPACING) {
    posts.push({ position: [x, POST_HEIGHT / 2, -HALF_D] });
    posts.push({ position: [x, POST_HEIGHT / 2, HALF_D] });
  }

  for (let z = -HALF_D + 2.2; z <= HALF_D - 2.2; z += POST_SPACING) {
    posts.push({ position: [-HALF_W, POST_HEIGHT / 2, z] });
    posts.push({ position: [HALF_W, POST_HEIGHT / 2, z] });
  }

  return posts;
};

const Rail = ({
  args,
  position,
}: {
  args: [number, number, number];
  position: [number, number, number];
}) => (
  <mesh material={fenceMaterial} position={position} castShadow receiveShadow>
    <boxGeometry args={args} />
  </mesh>
);

export const Walls = () => {
  const posts = useMemo(() => buildPosts(), []);

  return (
    <group>
      {posts.map((post, i) => (
        <mesh
          key={i}
          material={fenceMaterial}
          position={post.position}
          castShadow
          receiveShadow
        >
          <boxGeometry args={[POST_SIZE, POST_HEIGHT, POST_SIZE]} />
        </mesh>
      ))}

      {RAIL_Y.map((y) => (
        <group key={`n-${y}`}>
          <Rail
            args={[ROOM_WIDTH, RAIL_SIZE, RAIL_SIZE]}
            position={[0, y, -HALF_D]}
          />
          <Rail
            args={[ROOM_WIDTH, RAIL_SIZE, RAIL_SIZE]}
            position={[0, y, HALF_D]}
          />
        </group>
      ))}

      {RAIL_Y.map((y) => (
        <group key={`e-${y}`}>
          <Rail
            args={[RAIL_SIZE, RAIL_SIZE, ROOM_DEPTH]}
            position={[-HALF_W, y, 0]}
          />
          <Rail
            args={[RAIL_SIZE, RAIL_SIZE, ROOM_DEPTH]}
            position={[HALF_W, y, 0]}
          />
        </group>
      ))}
    </group>
  );
};
