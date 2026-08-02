import { useEffect, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { ARENA_DEPTH, ARENA_WIDTH } from "@/lib/constants";
import { InputState } from "@/lib/types";

const HALF_W = ARENA_WIDTH / 2;
const HALF_D = ARENA_DEPTH / 2;
const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
const raycaster = new THREE.Raycaster();
const intersection = new THREE.Vector3();

export const PointerTracker = ({
  inputRef,
}: {
  inputRef: React.RefObject<InputState>;
}) => {
  const { camera, pointer, gl } = useThree();
  const mouseDownRef = useRef(false);

  useFrame(() => {
    const input = inputRef.current;

    if (!input) {
      return;
    }

    if (!mouseDownRef.current) {
      input.pointerActive = false;

      return;
    }

    raycaster.setFromCamera(pointer, camera);

    if (raycaster.ray.intersectPlane(plane, intersection)) {
      input.pointerActive = true;
      input.pointerPoint.x = THREE.MathUtils.clamp(
        intersection.x,
        -HALF_W,
        HALF_W,
      );
      input.pointerPoint.z = THREE.MathUtils.clamp(
        intersection.z,
        -HALF_D,
        HALF_D,
      );
    } else {
      input.pointerActive = false;
    }
  });

  useEffect(() => {
    const el = gl.domElement;
    const input = inputRef.current;

    const onPointerDown = (e: PointerEvent) => {
      if (e.button === 0) {
        mouseDownRef.current = true;
      }
    };

    const onPointerUp = () => {
      mouseDownRef.current = false;

      if (input) {
        input.pointerActive = false;
      }
    };

    const onLeave = () => {
      mouseDownRef.current = false;

      if (input) {
        input.pointerActive = false;
      }
    };

    el.addEventListener("pointerdown", onPointerDown);
    el.addEventListener("pointerup", onPointerUp);
    el.addEventListener("pointerleave", onLeave);

    return () => {
      el.removeEventListener("pointerdown", onPointerDown);
      el.removeEventListener("pointerup", onPointerUp);
      el.removeEventListener("pointerleave", onLeave);
    };
  }, [gl.domElement, inputRef]);

  return null;
};
