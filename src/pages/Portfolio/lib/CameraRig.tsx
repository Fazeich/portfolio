import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { isAutoloopFrozen } from "@/lib/autoloop";
import {
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
import { groundHeight, world } from "./world";

const desired = new THREE.Vector3();
const lookDesired = new THREE.Vector3();
const project = new THREE.Vector3();
const current = new THREE.Vector3();
const currentLook = new THREE.Vector3();

export const CameraRig = ({ state }: { state: TownState }) => {
  useFrame(({ camera, size }, delta) => {
    if (isAutoloopFrozen()) {
      return;
    }

    const dt = Math.min(delta, 0.05);
    const p = state.player;
    const pedestals = world.pedestals;

    let nearest = -1;
    let nearestDist = INTERACTION_RADIUS;

    for (let i = 0; i < pedestals.length; i += 1) {
      const pedestal = pedestals[i];
      const dx = p.x - pedestal.position.x;
      const dz = p.z - pedestal.position.z;
      const distance = Math.sqrt(dx * dx + dz * dz);

      if (distance < nearestDist) {
        nearestDist = distance;
        nearest = i;
      }
    }

    const inRange = !state.interacting && nearest >= 0;
    const groundY = groundHeight(p.x, p.z);

    if (state.interacting) {
      const pedestal =
        pedestals.find((item) => item.target === state.interactionTarget) ??
        pedestals[0];

      if (pedestal) {
        const baseY = groundHeight(
          pedestal.position.x,
          pedestal.position.z,
        );

        desired.set(
          pedestal.position.x,
          baseY + pedestal.height + INTERACTION_CAMERA_HEIGHT_OFFSET,
          pedestal.position.z + INTERACTION_CAMERA_BACK,
        );
        lookDesired.set(
          pedestal.position.x,
          baseY + pedestal.height + INTERACTION_CAMERA_LOOK_Y,
          pedestal.position.z,
        );
      }
    } else {
      desired.set(p.x, groundY + CAMERA_HEIGHT, p.z + CAMERA_BACK);

      if (inRange) {
        desired.y += CAMERA_ALTAR_FOCUS_RAISE;
      }

      lookDesired.set(p.x, groundY + 1, p.z);
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
      const pedestal = pedestals[nearest];
      const baseY = groundHeight(pedestal.position.x, pedestal.position.z);

      project
        .set(
          pedestal.position.x,
          baseY + pedestal.height + 0.7,
          pedestal.position.z,
        )
        .project(camera);

      state.tooltip.visible = true;
      state.tooltip.x = (project.x * 0.5 + 0.5) * size.width;
      state.tooltip.y = (-project.y * 0.5 + 0.5) * size.height;
      state.tooltip.label = pedestal.label;
      state.tooltip.keyHint = pedestal.keyHint;
      state.tooltip.target = pedestal.target;
      state.hoveredPedestalId = pedestal.id;
    } else {
      state.tooltip.visible = false;
      state.tooltip.target = "";
      state.hoveredPedestalId = null;
    }
  });

  return null;
};
