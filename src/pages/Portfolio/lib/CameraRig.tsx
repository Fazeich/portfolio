import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { ALTARS, CAMERA_BACK, CAMERA_HEIGHT, INTERACTION_RADIUS } from "./constants";
import { TownState } from "./state";

const desired = new THREE.Vector3();
const lookAt = new THREE.Vector3();
const project = new THREE.Vector3();

export const CameraRig = ({ state }: { state: TownState }) => {
  useFrame(({ camera, size }) => {
    const p = state.player;

    desired.set(p.x, CAMERA_HEIGHT, p.z + CAMERA_BACK);
    camera.position.copy(desired);

    lookAt.set(p.x, 1, p.z);
    camera.lookAt(lookAt);

    let nearest = -1;
    let nearestDist = INTERACTION_RADIUS;

    for (let i = 0; i < ALTARS.length; i += 1) {
      const altar = ALTARS[i];
      const dx = p.x - altar.position.x;
      const dz = p.z - altar.position.z;
      const dist = Math.sqrt(dx * dx + dz * dz);

      if (dist < nearestDist) {
        nearestDist = dist;
        nearest = i;
      }
    }

    const inRange = !state.interacting && nearest >= 0;

    if (inRange) {
      const altar = ALTARS[nearest];

      project
        .set(altar.position.x, altar.height + 0.7, altar.position.z)
        .project(camera);

      state.tooltip.visible = true;
      state.tooltip.x = (project.x * 0.5 + 0.5) * size.width;
      state.tooltip.y = (-project.y * 0.5 + 0.5) * size.height;
      state.tooltip.label = altar.label;
      state.tooltip.keyHint = altar.keyHint;
      state.tooltip.target = altar.target;
    } else {
      state.tooltip.visible = false;
      state.tooltip.target = "";
    }
  });

  return null;
};
