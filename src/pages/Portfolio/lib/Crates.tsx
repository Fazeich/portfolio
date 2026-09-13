import { useFrame } from "@react-three/fiber";
import { useEffect, useLayoutEffect, useMemo, useRef, useSyncExternalStore } from "react";
import * as THREE from "three";
import { isAutoloopFrozen } from "@/lib/autoloop";
import { TownState } from "./state";
import { getWorldRevision, groundHeight, subscribeWorld, world } from "./world";
import { Prop } from "./world/types";
import { voxelMaterial } from "@/lib/voxel";
import { createCrateGeometry } from "./crateGeometry";
import { CrateBody, createCrateBody, stepCrates } from "./cratePhysics";

const blockMaterial = voxelMaterial({ roughness: 0.92 });
const MAX_BLOCKS = 48 * 9;

export const Crates = ({
  state,
  radius,
}: {
  state: TownState;
  radius: number;
}) => {
  const revision = useSyncExternalStore(subscribeWorld, getWorldRevision, getWorldRevision);
  const cache = useRef(new WeakMap<Prop, CrateBody>());
  const blocks = useMemo(() => {
    void revision;
    return world.props.filter((prop) => prop.kind === "crate").map((prop) => {
      let block = cache.current.get(prop);
      if (!block) { block = createCrateBody(prop.x, prop.y, prop.z, prop.rotation); cache.current.set(prop, block); }
      return block;
    });
  }, [revision]);
  const geometry = useMemo(createCrateGeometry, []);
  useEffect(() => () => geometry.dispose(), [geometry]);
  const meshRef = useRef<THREE.InstancedMesh>(null);
  useEffect(() => {
    const mesh = meshRef.current;
    return () => { if (mesh) THREE.InstancedMesh.prototype.dispose.call(mesh); };
  }, []);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const prevPos = useRef({ x: state.player.x, z: state.player.z });

  useLayoutEffect(() => {
    const mesh = meshRef.current;
    if (!mesh) return;
    mesh.count = blocks.length;
    mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    for (let i = 0; i < blocks.length; i += 1) {
      dummy.position.set(blocks[i].x, blocks[i].y, blocks[i].z);
      dummy.rotation.set(blocks[i].rx, blocks[i].ry, blocks[i].rz);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    }
    mesh.instanceMatrix.needsUpdate = true;
  }, [blocks, dummy]);

  useFrame((_, delta) => {
    if (isAutoloopFrozen()) {
      return;
    }

    const dt = Math.min(delta, 0.05);
    const p = state.player;

    const dx = p.x - prevPos.current.x, dz = p.z - prevPos.current.z;
    const teleported = Math.hypot(dx, dz) > 3;
    const vx = teleported ? 0 : dx / Math.max(dt, 1e-4);
    const vz = teleported ? 0 : dz / Math.max(dt, 1e-4);
    prevPos.current.x = p.x;
    prevPos.current.z = p.z;
    const nearby = blocks.filter((block) => !block.resting ||
      (block.x - p.x) ** 2 + (block.z - p.z) ** 2 < 18 ** 2);
    stepCrates(nearby, { x: p.x, y: teleported ? -1000000 : p.y, z: p.z, vx, vz, radius: teleported ? 0 : radius }, groundHeight, dt);

    const mesh = meshRef.current;
    if (!mesh) return;
    mesh.count = blocks.length;
    for (let i = 0; i < blocks.length; i += 1) {
      dummy.position.set(blocks[i].x, blocks[i].y, blocks[i].z);
      dummy.rotation.set(blocks[i].rx, blocks[i].ry, blocks[i].rz);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    }
    mesh.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[geometry, blockMaterial, MAX_BLOCKS]}
      castShadow receiveShadow frustumCulled={false} dispose={null} />
  );
};
