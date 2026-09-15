import { Billboard, Center, Text3D } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useRef, useSyncExternalStore } from "react";
import * as THREE from "three";
import { box, mergeVoxelParts, VoxelPart, voxelMaterial } from "@/lib/voxel";
import { isAutoloopFrozen } from "@/lib/autoloop";
import fontUrl from "@/lib/assets/fonts/helvetiker_bold.typeface.json?url";
import {
  getWorldRevision,
  groundHeight,
  subscribeWorld,
  world,
} from "./world";
import { PedestalDef } from "./world/types";
import { TownState } from "./state";

const stoneMaterial = voxelMaterial({ roughness: 0.78 });
const stoneParts: VoxelPart[] = [
  { geometry: box(2.6, 0.22, 2.0), color: "#778c92", position: [0, 0.11, 0] },
  { geometry: box(2.35, 0.18, 1.8), color: "#d9d6bb", position: [0, 0.31, 0] },
  { geometry: box(2.1, 0.36, 1.55), color: "#405b65", position: [0, 0.58, 0] },
  { geometry: box(2.3, 0.12, 1.75), color: "#c4cfbf", position: [0, 0.82, 0] },
  { geometry: box(2.25, 0.28, 0.5), color: "#d3d4be", position: [0, 3.1, -0.15] },
  { geometry: box(1.8, 0.13, 0.6), color: "#6c858a", position: [0, 3.3, -0.15] },
];
for (const side of [-1, 1]) {
  stoneParts.push({ geometry: box(0.32, 2.15, 0.4), color: "#81999c", position: [side * 0.94, 1.95, -0.15] });
  stoneParts.push({ geometry: box(0.46, 0.22, 0.56), color: "#d7d3b7", position: [side * 0.94, 1, -0.15] });
  stoneParts.push({ geometry: box(0.46, 0.18, 0.56), color: "#d7d3b7", position: [side * 0.94, 2.85, -0.15] });
}
const stoneGeometry = mergeVoxelParts(stoneParts);
const snakeGeometry = mergeVoxelParts([
  ...[[-0.5, -0.35], [-0.2, -0.35], [0.1, -0.35], [0.1, -0.05], [-0.2, -0.05], [-0.2, 0.25], [0.1, 0.25], [0.4, 0.25]].map(([x, y], i): VoxelPart => ({
    geometry: box(0.29, 0.29, 0.28), color: i === 7 ? "#b8f38b" : "#62d889", position: [x, y, 0],
  })),
  { geometry: box(0.05, 0.05, 0.03), color: "#173936", position: [0.44, 0.3, 0.155] },
]);

const Pedestal = ({
  pedestal,
  state,
}: {
  pedestal: PedestalDef;
  state: TownState;
}) => {
  const ringRef = useRef<THREE.Mesh>(null);
  const emblemRef = useRef<THREE.Group>(null);
  const animationTime = useRef(0);

  useFrame((_, delta) => {
    if (state.paused || isAutoloopFrozen()) return;
    animationTime.current += Math.min(delta, 0.05);
    if (isAutoloopFrozen()) return;
    const active = state.hoveredPedestalId === pedestal.id;
    const t = animationTime.current;
    const pulse = active ? 0.5 + 0.5 * Math.sin(t * 3) : 0;

    if (emblemRef.current) {
      emblemRef.current.position.y = 2.0 + Math.sin(t * 1.6) * 0.08;
      emblemRef.current.rotation.y = Math.sin(t * 0.8) * 0.22;
    }
    if (ringRef.current) {
      ringRef.current.scale.setScalar(active ? 1 + pulse * 0.4 : 0.01);
      (ringRef.current.material as THREE.MeshBasicMaterial).opacity = active
        ? 0.35 + pulse * 0.3
        : 0;
    }
  });

  const y = groundHeight(pedestal.position.x, pedestal.position.z);

  return (
    <group position={[pedestal.position.x, y, pedestal.position.z]}>
      <mesh geometry={stoneGeometry} material={stoneMaterial} dispose={null} castShadow receiveShadow />
      {/* Emissive trim uses no additional lights, keeping shader counts stable. */}
      {[-1, 1].map((side) => (
        <mesh key={side} position={[side * 0.94, 1.94, 0.075]}>
          <boxGeometry args={[0.065, 1.55, 0.025]} />
          <meshStandardMaterial color={pedestal.accent} emissive={pedestal.accent} emissiveIntensity={1.5} />
        </mesh>
      ))}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.9, 0]}>
        <ringGeometry args={[0.5, 0.64, 32]} />
        <meshBasicMaterial color={pedestal.accent} />
      </mesh>
      <group ref={emblemRef} position={[0, 2, 0]}>
        {pedestal.target === "/snake" ? (
          <mesh geometry={snakeGeometry} material={stoneMaterial} dispose={null} castShadow />
        ) : (
          <Center>
            <Text3D font={fontUrl} size={0.95} height={0.18} bevelEnabled bevelSize={0.015} bevelThickness={0.015} bevelSegments={1} curveSegments={4}>
              A
              <meshStandardMaterial color="#ffd68c" emissive={pedestal.accent} emissiveIntensity={0.35} />
            </Text3D>
          </Center>
        )}
      </group>
      <Billboard position={[0, 3.9, 0]}>
        <mesh position={[0, 0, -0.08]}>
          <boxGeometry args={[3.8, 0.68, 0.12]} />
          <meshStandardMaterial color="#233e49" roughness={0.7} />
        </mesh>
        <mesh position={[0, -0.31, 0]}>
          <boxGeometry args={[3.55, 0.035, 0.035]} />
          <meshBasicMaterial color={pedestal.accent} />
        </mesh>
        <Center>
          <Text3D font={fontUrl} size={0.38} height={0.035} curveSegments={4} letterSpacing={0.01}>
            {pedestal.label}
            <meshStandardMaterial color="#fff2d7" roughness={0.7} />
          </Text3D>
        </Center>
      </Billboard>
      <mesh position={[0, 0.58, 0.795]}>
        <boxGeometry args={[0.43, 0.3, 0.06]} />
        <meshStandardMaterial color="#e6d3a3" />
      </mesh>
      <group position={[0, 0.58, 0.835]}>
        <Center>
          <Text3D font={fontUrl} size={0.2} height={0.015} curveSegments={2}>
            E
            <meshBasicMaterial color="#233e49" />
          </Text3D>
        </Center>
      </group>

      <mesh
        ref={ringRef}
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0.03, 0]}
        scale={0.01}
      >
        <ringGeometry args={[1.7, 2.05, 48]} />
        <meshBasicMaterial
          color={pedestal.accent}
          transparent
          opacity={0}
          depthWrite={false}
        />
      </mesh>

    </group>
  );
};

export const Pedestals = ({ state }: { state: TownState }) => {
  const lightRef = useRef<THREE.PointLight>(null);
  const animationTime = useRef(0);
  useFrame((_, delta) => {
    if (state.paused || isAutoloopFrozen()) return;
    animationTime.current += Math.min(delta, 0.05);
    const light = lightRef.current;
    if (!light) return;
    const active = world.pedestals.find((pedestal) => pedestal.id === state.hoveredPedestalId);
    light.intensity = active ? 1.8 + Math.sin(animationTime.current * 3) * 0.4 : 0;
    if (active) {
      light.position.set(active.position.x, groundHeight(active.position.x, active.position.z) + 3.3, active.position.z);
      light.color.set(active.accent);
    }
  });
  const revision = useSyncExternalStore(
    subscribeWorld,
    getWorldRevision,
    getWorldRevision,
  );

  void revision;

  return (
    <group>
      {/* A constant light count avoids recompiling every material on chunk shifts. */}
      <pointLight ref={lightRef} intensity={0} distance={9} />
      {world.pedestals.map((pedestal) => (
        <Pedestal
          key={pedestal.id}
          pedestal={pedestal}
          state={state}
        />
      ))}
    </group>
  );
};
