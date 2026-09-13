import { useEffect, useLayoutEffect, useMemo, useRef, useSyncExternalStore } from "react";
import * as THREE from "three";
import { box, mergeVoxelParts, VoxelPart, voxelMaterial } from "@/lib/voxel";
import { getWorldRevision, subscribeWorld, world } from "./world";
import { RAMP_SIZES } from "./world/ramps";

const material = voxelMaterial({ roughness: 0.85, side: THREE.DoubleSide });
const buildRamp = (variant: number) => {
  const { width, length, height } = RAMP_SIZES[variant];
  const deck = new THREE.PlaneGeometry(width, length, 1, 16);
  deck.rotateX(-Math.PI / 2);
  const positions = deck.attributes.position;
  for (let i = 0; i < positions.count; i += 1) {
    const t = (positions.getZ(i) + length / 2) / length;
    positions.setY(i, height * t * t);
  }
  deck.computeVertexNormals();
  const parts: VoxelPart[] = [{ geometry: deck, color: "#425862" }];
  for (let i = 1; i <= 8; i += 1) {
    const t = i / 8, y = height * t * t, z = length * (t - 0.5);
    const slope = Math.atan(2 * height * t / length);
    for (const side of [-1, 1]) {
      parts.push({ geometry: box(0.15, 0.05, length / 8 + 0.03), color: i % 2 ? "#ffcb5e" : "#e8e6cc", position: [side * (width / 2 - 0.12), height * ((i - 0.5) / 8) ** 2 + 0.035, z - length / 16], rotation: [-slope, 0, 0] });
    }
    if (i % 2 === 0) {
      parts.push({ geometry: box(width - 0.3, 0.035, 0.06), color: "#8faaa9", position: [0, y + 0.025, z], rotation: [-slope, 0, 0] });
      for (const side of [-1, 1]) parts.push({ geometry: box(0.18, Math.max(0.1, y), 0.18), color: "#856443", position: [side * (width / 2 - 0.25), y / 2, z] });
    }
  }
  // Large forward arrow, readable from the follow camera.
  for (const side of [-1, 1]) parts.push({ geometry: box(0.12, 0.045, 0.85), color: "#ffcf62", position: [side * 0.25, height * 0.36 + 0.04, length * 0.1], rotation: [-Math.atan(1.2 * height / length), side * -0.65, 0] });
  return mergeVoxelParts(parts);
};

export const Ramps = () => {
  const revision = useSyncExternalStore(subscribeWorld, getWorldRevision, getWorldRevision);
  const geometries = useMemo(() => [0, 1, 2].map(buildRamp), []);
  const meshes = useRef<Array<THREE.InstancedMesh | null>>([]);
  useEffect(() => {
    const instances = meshes.current.slice();
    return () => { geometries.forEach((g) => g.dispose()); instances.forEach((mesh) => { if (mesh) THREE.InstancedMesh.prototype.dispose.call(mesh); }); };
  }, [geometries]);
  useLayoutEffect(() => {
    const dummy = new THREE.Object3D();
    for (let variant = 0; variant < 3; variant += 1) {
      const mesh = meshes.current[variant];
      if (!mesh) continue;
      let count = 0;
      for (const ramp of world.ramps) {
        if (ramp.variant !== variant) continue;
        dummy.position.set(ramp.x, ramp.y, ramp.z);
        dummy.rotation.y = ramp.heading;
        dummy.updateMatrix();
        mesh.setMatrixAt(count++, dummy.matrix);
      }
      mesh.count = count;
      mesh.instanceMatrix.needsUpdate = true;
    }
  }, [revision]);
  return <group>{geometries.map((geometry, i) => (
    <instancedMesh key={i} ref={(mesh) => { meshes.current[i] = mesh; }}
      args={[geometry, material, 48]} castShadow receiveShadow frustumCulled={false} dispose={null} />
  ))}</group>;
};
