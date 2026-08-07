import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import {
  ALTARS,
  CAMERA_ALTAR_FOCUS_RAISE,
  CAMERA_BACK,
  CAMERA_BLEND,
  CAMERA_FOV,
  CAMERA_FOV_NEAR_ALTAR,
  CAMERA_HEIGHT,
  CAMERA_LOOK_BLEND,
  INTERACTION_CAMERA_BACK,
  INTERACTION_CAMERA_HEIGHT_OFFSET,
  INTERACTION_CAMERA_LOOK_Y,
  INTERACTION_CAMERA_SPEED,
  INTERACTION_RADIUS,
} from "./constants";
import { TownState } from "./state";

const desired = new THREE.Vector3();
const lookDesired = new THREE.Vector3();
const project = new THREE.Vector3();
const current = new THREE.Vector3();
const currentLook = new THREE.Vector3();

export const CameraRig = ({ state }: { state: TownState }) => {
  useFrame(({ camera, size }, delta) => {
    const dt = Math.min(delta, 0.05);
    const p = state.player;

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

    if (state.interacting) {
      const altar =
        ALTARS.find((a) => a.target === state.interactionTarget) ?? ALTARS[0];

      desired.set(
        altar.position.x,
        altar.height + INTERACTION_CAMERA_HEIGHT_OFFSET,
        altar.position.z + INTERACTION_CAMERA_BACK,
      );
      lookDesired.set(
        altar.position.x,
        altar.height + INTERACTION_CAMERA_LOOK_Y,
        altar.position.z,
      );
    } else {
      desired.set(p.x, CAMERA_HEIGHT, p.z + CAMERA_BACK);

      if (inRange) {
        desired.y += CAMERA_ALTAR_FOCUS_RAISE;
      }

      lookDesired.set(p.x, 1, p.z);
    }

    if (current.lengthSq() === 0) {
      current.copy(desired);
      currentLook.copy(lookDesired);
    } else {
      const speed = state.interacting ? INTERACTION_CAMERA_SPEED : 1;
      const blend = 1 - Math.exp(-CAMERA_BLEND * speed * dt);
      const lookBlend = 1 - Math.exp(-CAMERA_LOOK_BLEND * speed * dt);

      current.lerp(desired, blend);
      currentLook.lerp(lookDesired, lookBlend);
    }

    camera.position.copy(current);
    camera.lookAt(currentLook);

    const targetFov = state.interacting
      ? CAMERA_FOV - 4
      : inRange
        ? CAMERA_FOV_NEAR_ALTAR
        : CAMERA_FOV;

    const cam = camera as THREE.PerspectiveCamera;

    cam.fov += (targetFov - cam.fov) * (1 - Math.exp(-CAMERA_BLEND * dt));
    cam.updateProjectionMatrix();

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
      state.hoveredAltarId = altar.id;
    } else {
      state.tooltip.visible = false;
      state.tooltip.target = "";
      state.hoveredAltarId = null;
    }
  });

  return null;
};
