import * as THREE from "three";
import { LANTERN_POSITIONS } from "./constants";

const poleMaterial = new THREE.MeshStandardMaterial({
  color: "#3f3a33",
  roughness: 0.7,
  metalness: 0.4,
});

const globeMaterial = new THREE.MeshStandardMaterial({
  color: "#ffe7b8",
  emissive: "#ffcf8a",
  emissiveIntensity: 1.6,
  roughness: 0.3,
  metalness: 0,
});

export const Lanterns = () => (
  <group>
    {LANTERN_POSITIONS.map((lantern, i) => (
      <group key={i} position={[lantern.x, 0, lantern.z]}>
        <mesh material={poleMaterial} position={[0, 1.3, 0]} castShadow>
          <cylinderGeometry args={[0.07, 0.11, 2.6, 6]} />
        </mesh>
        <mesh material={globeMaterial} position={[0, 2.85, 0]}>
          <sphereGeometry args={[0.24, 12, 10]} />
        </mesh>
        <pointLight position={[0, 2.85, 0]} intensity={0.9} distance={9} color="#ffd9a0" />
      </group>
    ))}
  </group>
);
