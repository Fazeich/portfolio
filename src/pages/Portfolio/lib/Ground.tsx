import { useMemo } from "react";
import * as THREE from "three";
import { GROUND_EXTENT } from "./constants";

export const Ground = () => {
  const material = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        color: new THREE.Color("#f2ebe5"),
        roughness: 0.32,
        metalness: 0,
        clearcoat: 0.55,
        clearcoatRoughness: 0.3,
      }),
    [],
  );

  return (
    <mesh
      rotation={[-Math.PI / 2, 0, 0]}
      receiveShadow
      material={material}
    >
      <planeGeometry args={[GROUND_EXTENT, GROUND_EXTENT]} />
    </mesh>
  );
};
