import { useEffect, useLayoutEffect, useMemo, useRef, useSyncExternalStore } from "react";
import * as THREE from "three";
import { box, mergeVoxelParts, VoxelPart, voxelMaterial } from "@/lib/voxel";
import {
  getWorldRevision,
  subscribeWorld,
  world,
} from "./world";
import { BIOMES } from "./world/biomes";
import { Prop } from "./world/types";

const material = voxelMaterial({ roughness: 0.9 });
const foliageMaterial = voxelMaterial({
  roughness: 0.9,
  side: THREE.DoubleSide,
});

const TRUNK = "#8a5a34";
const LEAF_DARK = "#357f3c";
const LEAF = "#46a24a";
const LEAF_LIGHT = "#63c45a";

const buildTree = (variant: number): THREE.BufferGeometry => {
  const parts: VoxelPart[] = [];
  const trunkHeight = variant === 2 ? 2.5 : 1.9;
  parts.push({ geometry: box(0.34, trunkHeight, 0.38), color: TRUNK, position: [0, trunkHeight / 2, 0] });
  // Exposed roots, bark stripe and branching give the trunk a readable base.
  parts.push({ geometry: box(0.09, trunkHeight * 0.82, 0.04), color: "#b08049", position: [0.08, trunkHeight * 0.46, 0.2] });
  for (let i = 0; i < 3; i += 1) {
    const angle = i * Math.PI * 2 / 3;
    parts.push({ geometry: box(0.22, 0.22, 0.7), color: "#735033", position: [Math.sin(angle) * 0.22, 0.11, Math.cos(angle) * 0.22], rotation: [0, angle, 0] });
  }
  if (variant === 2) {
    // Fir: broad tiered skirt and a narrow, offset crown.
    for (let i = 0; i < 4; i += 1) {
      const size = 2.15 - i * 0.44;
      parts.push({ geometry: new THREE.ConeGeometry(size * 0.7, 1.2, 5), color: [LEAF_DARK, "#36894c", LEAF, LEAF_LIGHT][i], position: [i * 0.035, 1.65 + i * 0.6, 0], rotation: [0, i * 0.4, 0] });
    }
  } else {
    for (const side of [-1, 1]) {
      parts.push({ geometry: box(0.2, 0.85, 0.22), color: TRUNK, position: [side * 0.28, 1.75, 0], rotation: [0, 0, -side * 0.65] });
    }
    const clusters = variant === 0
      ? [[-0.65, 2.15, 0.1, 1.25], [0.62, 2.35, 0.12, 1.3], [0, 2.55, -0.5, 1.45], [0.1, 3.05, 0.03, 1.2], [-0.4, 2.5, 0.6, 0.9]]
      : [[-0.42, 2.25, 0, 1.1], [0.48, 2.65, 0.1, 1.0], [-0.13, 3.1, -0.15, 1.2], [0.1, 3.65, 0, 0.85]];
    clusters.forEach(([x, y, z, size], i) => {
      parts.push({ geometry: box(size, size * 0.8, size * 0.88), color: [LEAF_DARK, LEAF, LEAF, LEAF_LIGHT, "#78c862"][i], position: [x, y, z], rotation: [0, i * 0.22, 0] });
      if (i < 3) parts.push({ geometry: box(size * 0.5, 0.12, size * 0.45), color: "#80c969", position: [x - 0.12, y + size * 0.4, z + 0.1] });
    });
  }
  return mergeVoxelParts(parts);
};

const buildRock = (variant: number): THREE.BufferGeometry => {
  const parts: VoxelPart[] = [];
  const geometry = new THREE.DodecahedronGeometry(0.68, 0);
  const position = geometry.attributes.position;
  for (let i = 0; i < position.count; i += 1) {
    const x = position.getX(i), y = position.getY(i), z = position.getZ(i);
    const distort = 1 + Math.sin(x * 12 + z * 7 + variant * 3) * 0.12;
    position.setXYZ(i, x * distort, y * (0.72 + variant * 0.17), z * distort);
  }
  geometry.computeVertexNormals();
  parts.push({ geometry, color: "#e4e0d7", position: [0, 0.42, 0], rotation: [0.12, variant * 0.7, 0.1] });
  parts.push({ geometry: new THREE.IcosahedronGeometry(0.32, 0), color: "#c3c2b6", position: [-0.48, 0.2, 0.25], scale: [1.1, 0.7, 0.85] });
  if (variant !== 1) {
    parts.push({ geometry: box(0.42, 0.055, 0.3), color: "#92ac72", position: [0.02, 0.87 + variant * 0.03, 0.02], rotation: [0.1, 0.3, -0.1] });
  } else {
    parts.push({ geometry: new THREE.DodecahedronGeometry(0.35, 0), color: "#f1e8d3", position: [0.3, 0.64, -0.24], scale: [0.65, 1.2, 0.8] });
  }
  return mergeVoxelParts(parts);
};

const blade = (width: number, height: number): THREE.BufferGeometry =>
  new THREE.PlaneGeometry(width, height);

const buildGrass = (variant: number): THREE.BufferGeometry => {
  const parts: VoxelPart[] = [];
  const tilt = variant === 0 ? 0.18 : 0.32;
  const blades: Array<[number, number, number, number, number, number, number]> = [
    [0, 0.26, 0, 0, 0, tilt, 0.52],
    [0.1, 0.21, 0.06, 0.2, 0.9, -tilt, 0.42],
    [-0.08, 0.18, -0.06, -0.25, -0.8, tilt, 0.36],
    [0.04, 0.15, -0.12, 0.15, 1.8, -tilt * 0.7, 0.3],
    [-0.12, 0.14, 0.08, -0.1, 2.6, tilt * 0.8, 0.28],
  ];

  for (const [x, y, z, rx, ry, rz, height] of blades) {
    parts.push({
      geometry: blade(height * 0.18, height),
      color: "#ffffff",
      position: [x, y, z],
      rotation: [rx, ry, rz],
    });
  }

  return mergeVoxelParts(parts);
};

const FLOWER_HEADS = ["#ffd452", "#ff9ecb", "#ffffff", "#ff6b6b"];

const buildFlower = (variant: number): THREE.BufferGeometry => {
  const head = FLOWER_HEADS[variant % FLOWER_HEADS.length];
  const parts: VoxelPart[] = [
    { geometry: box(0.06, 0.4, 0.06), color: "#5aa843", position: [0, 0.2, 0] },
    { geometry: box(0.2, 0.16, 0.2), color: head, position: [0, 0.46, 0] },
  ];

  return mergeVoxelParts(parts);
};

const InstancedGroup = ({
  geometry,
  items,
  tint,
  surfaceMaterial = material,
  capacity,
  castShadow = true,
}: {
  geometry: THREE.BufferGeometry;
  items: Prop[];
  tint?: (item: Prop) => string;
  surfaceMaterial?: THREE.Material;
  capacity: number;
  castShadow?: boolean;
}) => {
  const ref = useRef<THREE.InstancedMesh>(null);
  useEffect(() => {
    const mesh = ref.current;
    return () => { if (mesh) THREE.InstancedMesh.prototype.dispose.call(mesh); };
  }, []);

  useLayoutEffect(() => {
    const mesh = ref.current;

    if (!mesh) {
      return;
    }

    const dummy = new THREE.Object3D();
    const color = new THREE.Color();

    for (let i = 0; i < items.length; i += 1) {
      const item = items[i];

      dummy.position.set(item.x, item.y, item.z);
      dummy.rotation.set(0, item.rotation, 0);
      dummy.scale.setScalar(item.scale);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);

      if (tint) {
        mesh.setColorAt(i, color.set(tint(item)));
      }
    }

    mesh.count = items.length;
    mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    mesh.instanceMatrix.needsUpdate = true;

    if (mesh.instanceColor) {
      mesh.instanceColor.needsUpdate = true;
    }
  }, [items, tint, geometry]);

  return (
    <instancedMesh
      ref={ref}
      args={[geometry, surfaceMaterial, capacity]}
      dispose={null}
      castShadow={castShadow}
      receiveShadow
      frustumCulled={false}
    />
  );
};

const groupByVariant = (kind: Prop["kind"], variants: number): Prop[][] => {
  const groups: Prop[][] = Array.from({ length: variants }, () => []);

  for (const prop of world.props) {
    if (prop.kind === kind) {
      groups[prop.variant % variants].push(prop);
    }
  }

  return groups;
};

const tintByBiome = (item: Prop): string => {
  const biome = BIOMES[item.biome];

  return item.kind === "rock" ? biome.rock : biome.grass;
};

export const Props = () => {
  const revision = useSyncExternalStore(
    subscribeWorld,
    getWorldRevision,
    getWorldRevision,
  );
  const treeGeometries = useMemo(() => [0, 1, 2].map(buildTree), []);
  const rockGeometries = useMemo(() => [0, 1, 2].map(buildRock), []);
  const grassGeometries = useMemo(() => [0, 1, 2].map(buildGrass), []);
  const flowerGeometries = useMemo(() => [0, 1, 2, 3].map(buildFlower), []);
  useEffect(() => () => {
    [...treeGeometries, ...rockGeometries, ...grassGeometries, ...flowerGeometries]
      .forEach((geometry) => geometry.dispose());
  }, [treeGeometries, rockGeometries, grassGeometries, flowerGeometries]);

  const trees = useMemo(() => {
    void revision;
    return groupByVariant("tree", 3);
  }, [revision]);
  const rocks = useMemo(() => {
    void revision;
    return groupByVariant("rock", 3);
  }, [revision]);
  const grass = useMemo(() => {
    void revision;
    return groupByVariant("grass", 3);
  }, [revision]);
  const flowers = useMemo(() => {
    void revision;
    return groupByVariant("flower", 4);
  }, [revision]);

  return (
    <group>
      {trees.map((items, variant) => (
        <InstancedGroup key={`tree-${variant}`} geometry={treeGeometries[variant]} capacity={288} items={items} />
      ))}
      {rocks.map((items, variant) => (
        <InstancedGroup
          key={`rock-${variant}`}
          geometry={rockGeometries[variant]}
          capacity={336}
          items={items}
          tint={tintByBiome}
        />
      ))}
      {grass.map((items, variant) => (
        <InstancedGroup
          key={`grass-${variant}`}
          geometry={grassGeometries[variant]}
          capacity={4608}
          castShadow={false}
          items={items}
          tint={tintByBiome}
          surfaceMaterial={foliageMaterial}
        />
      ))}
      {flowers.map((items, variant) => (
        <InstancedGroup key={`flower-${variant}`} geometry={flowerGeometries[variant]} capacity={1536} castShadow={false} items={items} />
      ))}
    </group>
  );
};
