import * as THREE from "three";

const tint = new THREE.Color();
const position = new THREE.Vector3();
const quaternion = new THREE.Quaternion();
const euler = new THREE.Euler();
const scale = new THREE.Vector3();
const matrix = new THREE.Matrix4();

export interface VoxelPart {
  geometry: THREE.BufferGeometry;
  color: string;
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: [number, number, number];
}

const tinted = (
  geometry: THREE.BufferGeometry,
  color: string,
): THREE.BufferGeometry => {
  const source = geometry.index ? geometry.toNonIndexed() : geometry.clone();
  const count = source.attributes.position.count;
  const colors = new Float32Array(count * 3);

  tint.set(color);

  for (let i = 0; i < count; i += 1) {
    colors[i * 3] = tint.r;
    colors[i * 3 + 1] = tint.g;
    colors[i * 3 + 2] = tint.b;
  }

  source.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));

  return source;
};

export const mergeVoxelParts = (parts: VoxelPart[]): THREE.BufferGeometry => {
  const positions: number[] = [];
  const normals: number[] = [];
  const colors: number[] = [];

  for (const part of parts) {
    const geometry = tinted(part.geometry, part.color);

    position.set(...(part.position ?? [0, 0, 0]));
    euler.set(...(part.rotation ?? [0, 0, 0]));
    quaternion.setFromEuler(euler);
    scale.set(...(part.scale ?? [1, 1, 1]));
    matrix.compose(position, quaternion, scale);
    geometry.applyMatrix4(matrix);

    const pos = geometry.attributes.position;
    const normal = geometry.attributes.normal;
    const color = geometry.attributes.color;

    for (let i = 0; i < pos.count; i += 1) {
      positions.push(pos.getX(i), pos.getY(i), pos.getZ(i));
      normals.push(normal.getX(i), normal.getY(i), normal.getZ(i));
      colors.push(color.getX(i), color.getY(i), color.getZ(i));
    }

    geometry.dispose();
  }

  const merged = new THREE.BufferGeometry();

  merged.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  merged.setAttribute("normal", new THREE.Float32BufferAttribute(normals, 3));
  merged.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
  merged.computeBoundingSphere();

  return merged;
};

export const box = (
  width: number,
  height: number,
  depth: number,
): THREE.BufferGeometry => new THREE.BoxGeometry(width, height, depth);

export const voxelMaterial = (
  options: THREE.MeshStandardMaterialParameters = {},
): THREE.MeshStandardMaterial =>
  new THREE.MeshStandardMaterial({
    vertexColors: true,
    flatShading: true,
    roughness: 0.85,
    metalness: 0,
    ...options,
  });
