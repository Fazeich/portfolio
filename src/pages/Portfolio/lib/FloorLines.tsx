import * as THREE from "three";
import { HALF_D, HALF_W } from "./constants";

const LINE_Y = 0.02;
const LINE_HEIGHT = 0.02;
const LINE_WIDTH = 0.08;
const SQUARE_HALF = 2.5;

const floorLineMaterial = new THREE.MeshStandardMaterial({
  color: "#a89f92",
  roughness: 0.9,
});

const EdgeLine = ({
  args,
  position,
}: {
  args: [number, number, number];
  position: [number, number, number];
}) => (
  <mesh material={floorLineMaterial} position={position}>
    <boxGeometry args={args} />
  </mesh>
);

export const FloorLines = () => {
  const squareSize = SQUARE_HALF * 2;
  const eastLength = HALF_W - SQUARE_HALF;
  const westLength = HALF_W - SQUARE_HALF;
  const southLength = HALF_D - SQUARE_HALF;
  const northLength = HALF_D - SQUARE_HALF;

  return (
    <group>
      <EdgeLine
        args={[squareSize, LINE_HEIGHT, squareSize]}
        position={[0, LINE_Y, 0]}
      />

      <EdgeLine
        args={[eastLength, LINE_HEIGHT, LINE_WIDTH]}
        position={[(SQUARE_HALF + HALF_W) / 2, LINE_Y, 0]}
      />

      <EdgeLine
        args={[westLength, LINE_HEIGHT, LINE_WIDTH]}
        position={[-(SQUARE_HALF + HALF_W) / 2, LINE_Y, 0]}
      />

      <EdgeLine
        args={[LINE_WIDTH, LINE_HEIGHT, southLength]}
        position={[0, LINE_Y, (SQUARE_HALF + HALF_D) / 2]}
      />

      <EdgeLine
        args={[LINE_WIDTH, LINE_HEIGHT, northLength]}
        position={[0, LINE_Y, -(SQUARE_HALF + HALF_D) / 2]}
      />
    </group>
  );
};
