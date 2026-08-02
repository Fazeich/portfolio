import * as THREE from "three";
import { MAX_SEGMENTS, SEGMENT_RADIUS } from "@/lib/constants";
import { WorldState } from "@/lib/types";
import { segmentRadius } from "@/lib/physics";

const matrix = new THREE.Matrix4();
const position = new THREE.Vector3();
const quaternion = new THREE.Quaternion();
const scale = new THREE.Vector3();
const UP = new THREE.Vector3(0, 1, 0);
const dirVec = new THREE.Vector3();
const colorA = new THREE.Color();
const colorB = new THREE.Color();
const colorTemp = new THREE.Color();

export interface SnakePalette {
  head: string;
  body: string;
  tail: string;
}

export const syncSnakeMesh = (
  mesh: THREE.InstancedMesh,
  world: WorldState,
  palette: SnakePalette,
): void => {
  const { positions } = world.snake;
  const count = positions.length;
  const heading = world.snake.heading;

  colorA.set(palette.head);
  colorB.set(palette.tail);

  for (let i = 0; i < MAX_SEGMENTS; i += 1) {
    if (i < count) {
      const p = positions[i];
      position.set(p.x, p.y, p.z);

      if (i === 0) {
        dirVec.set(heading.x, heading.y, heading.z);
      } else {
        const prev = positions[i - 1];
        dirVec.set(p.x - prev.x, p.y - prev.y, p.z - prev.z);
      }

      if (dirVec.lengthSq() > 0.0001) {
        dirVec.normalize();
        quaternion.setFromUnitVectors(UP, dirVec);
      } else {
        quaternion.identity();
      }

      const t = count <= 1 ? 0 : i / (count - 1);
      colorTemp.copy(colorA).lerp(colorB, t);

      const radius = segmentRadius(i);
      const size = radius / SEGMENT_RADIUS;
      scale.set(size, 1, size);
      matrix.compose(position, quaternion, scale);
      mesh.setColorAt(i, colorTemp);
    } else {
      matrix.makeScale(0, 0, 0);
      mesh.setColorAt(i, colorA);
    }

    mesh.setMatrixAt(i, matrix);
  }

  mesh.instanceMatrix.needsUpdate = true;

  if (mesh.instanceColor) {
    mesh.instanceColor.needsUpdate = true;
  }
};
