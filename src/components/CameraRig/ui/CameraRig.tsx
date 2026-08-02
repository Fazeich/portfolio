import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { BOOST_MAX } from "@/lib/constants";
import { WorldState } from "@/lib/types";
import { $snake3d } from "@/stores/snake3d/snake3d";
import {
  BASE_FOV,
  BOOST_FOV,
  CAMERA_HEIGHT,
  CAMERA_OFFSET,
  LOOK_SMOOTH,
  ORBIT_HEIGHT,
  ORBIT_RADIUS,
  ORBIT_SPEED,
} from "@/components/CameraRig/lib/constants";

const target = new THREE.Vector3();
const desired = new THREE.Vector3();

export const CameraRig = ({ world }: { world: WorldState }) => {
  useFrame(({ camera, clock }, delta) => {
    const perspectiveCamera = camera as THREE.PerspectiveCamera;
    const phase = $snake3d.getState().phase;
    const time = clock.getElapsedTime();

    if (phase === "menu") {
      const angle = time * ORBIT_SPEED;
      camera.position.set(
        Math.cos(angle) * ORBIT_RADIUS,
        ORBIT_HEIGHT,
        Math.sin(angle) * ORBIT_RADIUS,
      );
      target.set(0, 3, 0);
      camera.lookAt(target);
      perspectiveCamera.fov = BASE_FOV;
      perspectiveCamera.updateProjectionMatrix();

      return;
    }

    const head = world.snake.positions[0];
    const heading = world.snake.heading;
    const boostRatio = 1 - world.snake.boost / BOOST_MAX;
    const kick = world.snake.boosting ? 1 : 0;

    desired.set(
      head.x - heading.x * CAMERA_OFFSET,
      head.y + CAMERA_HEIGHT,
      head.z - heading.z * CAMERA_OFFSET,
    );

    const smoothing = 1 - Math.exp(-LOOK_SMOOTH * delta);
    camera.position.lerp(desired, smoothing);

    target.set(head.x, head.y + 1.2, head.z);
    camera.lookAt(target);

    const targetFov = BASE_FOV + (BOOST_FOV - BASE_FOV) * kick * boostRatio;
    perspectiveCamera.fov +=
      (targetFov - perspectiveCamera.fov) * Math.min(1, delta * 8);
    perspectiveCamera.updateProjectionMatrix();
  });

  return null;
};
