import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";
import { PLAYER_SPAWN } from "./constants";
import { TownState } from "./state";
import { pollControls } from "./controls";
import { clampToRoom, resolveObstacles } from "./physics";
import { stepInteraction, tryStartInteraction } from "./interaction";

const CAR_MAX_SPEED = 15;
const CAR_REVERSE_SPEED = 6;
const CAR_ACCEL = 12;
const CAR_BRAKE = 26;
const CAR_ROLL = 5;
const CAR_STEER_RATE = 4.4;
const CAR_STEER_LIMIT = 0.5;
export const CAR_RADIUS = 0.6;
const WHEEL_RADIUS = 0.22;
const TURN_SPEED_MIN = 3.5;

const BODY = "#e05252";
const BODY_DARK = "#c23d3d";
const CABIN = "#263449";
const WINDOW = "#101c2e";
const LIGHT = "#fff3c4";
const WHEEL = "#1f1f1f";
const WHEEL_LIGHT = "#3a3a3a";

const lerp = (a: number, b: number, t: number): number => a + (b - a) * t;

const bodyMaterial = new THREE.MeshStandardMaterial({
  color: BODY,
  roughness: 0.55,
  metalness: 0.05,
});

const bodyDarkMaterial = new THREE.MeshStandardMaterial({
  color: BODY_DARK,
  roughness: 0.55,
});

const cabinMaterial = new THREE.MeshStandardMaterial({
  color: CABIN,
  roughness: 0.6,
});

const windowMaterial = new THREE.MeshStandardMaterial({
  color: WINDOW,
  roughness: 0.15,
  metalness: 0.3,
});

const lightMaterial = new THREE.MeshStandardMaterial({
  color: LIGHT,
  emissive: LIGHT,
  emissiveIntensity: 2,
  roughness: 0.3,
});

const wheelMaterial = new THREE.MeshStandardMaterial({
  color: WHEEL,
  roughness: 0.9,
});

const wheelLightMaterial = new THREE.MeshStandardMaterial({
  color: WHEEL_LIGHT,
  roughness: 0.5,
  metalness: 0.3,
});

interface CarState {
  speed: number;
  steer: number;
  wheelSpin: number;
  roll: number;
  pitch: number;
}

const Wheel = ({
  spinRef,
  steerRef,
  position,
}: {
  spinRef: React.RefObject<THREE.Group>;
  steerRef?: React.RefObject<THREE.Group>;
  position: [number, number, number];
}) => {
  const wheel = (
    <group ref={spinRef}>
      <mesh rotation={[0, 0, Math.PI / 2]} material={wheelMaterial} castShadow>
        <cylinderGeometry args={[WHEEL_RADIUS, WHEEL_RADIUS, 0.16, 16]} />
      </mesh>
      <mesh rotation={[0, 0, Math.PI / 2]} material={wheelLightMaterial}>
        <cylinderGeometry args={[0.09, 0.09, 0.17, 10]} />
      </mesh>
    </group>
  );

  if (steerRef) {
    return <group ref={steerRef} position={position}>{wheel}</group>;
  }

  return <group position={position}>{wheel}</group>;
};

export const CarModel = ({
  state,
  onNavigate,
}: {
  state: TownState;
  onNavigate: (path: string) => void;
}) => {
  const rootRef = useRef<THREE.Group>(null);
  const bodyRef = useRef<THREE.Group>(null);
  const steerLRef = useRef<THREE.Group>(null);
  const steerRRef = useRef<THREE.Group>(null);
  const wheelFLRef = useRef<THREE.Group>(null);
  const wheelFRRef = useRef<THREE.Group>(null);
  const wheelRLRef = useRef<THREE.Group>(null);
  const wheelRRRef = useRef<THREE.Group>(null);
  const carRef = useRef<CarState>({
    speed: 0,
    steer: 0,
    wheelSpin: 0,
    roll: 0,
    pitch: 0,
  });
  const navigateRef = useRef(onNavigate);
  navigateRef.current = onNavigate;

  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.05);
    const player = state.player;
    const car = carRef.current;

    if (stepInteraction(state, dt, navigateRef.current)) {
      return;
    }

    const ctrl = pollControls();

    if (ctrl.interact && tryStartInteraction(state)) {
      return;
    }

    const fwd = ctrl.moveDir.z < 0 ? 1 : 0;
    const back = ctrl.moveDir.z > 0 ? 1 : 0;

    if (fwd) {
      car.speed += CAR_ACCEL * dt;
    } else if (back) {
      if (car.speed > 0.5) {
        car.speed -= CAR_BRAKE * dt;
      } else {
        car.speed -= CAR_ACCEL * 0.5 * dt;
      }
    } else {
      const drag = Math.min(Math.abs(car.speed), CAR_ROLL * dt);

      car.speed -= Math.sign(car.speed) * drag;
    }

    car.speed = Math.max(-CAR_REVERSE_SPEED, Math.min(CAR_MAX_SPEED, car.speed));

    const steerInput = ctrl.moveDir.x;
    const dirSign = car.speed >= 0 ? 1 : -1;
    const speedFactor = Math.min(1, Math.abs(car.speed) / TURN_SPEED_MIN);
    const targetSteer = -steerInput * CAR_STEER_LIMIT;

    car.steer += (targetSteer - car.steer) * Math.min(1, 10 * dt);
    player.facing += car.steer * CAR_STEER_RATE * speedFactor * dirSign * dt;

    const fx = Math.sin(player.facing);
    const fz = Math.cos(player.facing);

    player.x += fx * car.speed * dt;
    player.z += fz * car.speed * dt;

    let hit = resolveObstacles(player, CAR_RADIUS);
    const prevX = player.x;
    const prevZ = player.z;

    clampToRoom(player);

    if (player.x !== prevX || player.z !== prevZ) {
      hit = true;
    }

    if (hit) {
      car.speed *= 0.25;
    }

    car.wheelSpin += (car.speed / WHEEL_RADIUS) * dt;
    car.roll = lerp(car.roll, -car.steer * speedFactor * 0.35, Math.min(1, 8 * dt));
    car.pitch = lerp(car.pitch, fwd ? 0.05 : back ? 0.08 : 0, Math.min(1, 6 * dt));

    if (rootRef.current) {
      rootRef.current.position.set(player.x, 0, player.z);
      rootRef.current.rotation.y = player.facing;
    }

    if (bodyRef.current) {
      bodyRef.current.rotation.z = car.roll;
      bodyRef.current.rotation.x = -car.pitch;
    }

    if (steerLRef.current) {
      steerLRef.current.rotation.y = car.steer;
    }

    if (steerRRef.current) {
      steerRRef.current.rotation.y = car.steer;
    }

    for (const ref of [wheelFLRef, wheelFRRef, wheelRLRef, wheelRRRef]) {
      if (ref.current) {
        ref.current.rotation.x = car.wheelSpin;
      }
    }
  });

  return (
    <group ref={rootRef} position={[PLAYER_SPAWN.x, 0, PLAYER_SPAWN.z]}>
      <group ref={bodyRef}>
        <Wheel spinRef={wheelRLRef} position={[0.55, WHEEL_RADIUS, -0.66]} />
        <Wheel spinRef={wheelRRRef} position={[-0.55, WHEEL_RADIUS, -0.66]} />
        <Wheel spinRef={wheelFLRef} steerRef={steerLRef} position={[0.55, WHEEL_RADIUS, 0.66]} />
        <Wheel spinRef={wheelFRRef} steerRef={steerRRef} position={[-0.55, WHEEL_RADIUS, 0.66]} />

        <mesh material={bodyMaterial} position={[0, 0.42, 0]} castShadow>
          <boxGeometry args={[1.3, 0.3, 1.35]} />
        </mesh>

        <mesh material={bodyMaterial} position={[0, 0.56, 0.36]} castShadow>
          <boxGeometry args={[1.1, 0.24, 0.62]} />
        </mesh>

        <mesh material={cabinMaterial} position={[0, 0.82, -0.2]} castShadow>
          <boxGeometry args={[0.8, 0.4, 0.6]} />
        </mesh>

        <mesh material={windowMaterial} position={[0, 0.9, 0.14]}>
          <boxGeometry args={[0.62, 0.22, 0.04]} />
        </mesh>

        <mesh material={windowMaterial} position={[0, 0.9, -0.54]}>
          <boxGeometry args={[0.62, 0.22, 0.04]} />
        </mesh>

        <mesh material={windowMaterial} position={[0.4, 0.9, -0.2]}>
          <boxGeometry args={[0.04, 0.22, 0.56]} />
        </mesh>

        <mesh material={windowMaterial} position={[-0.4, 0.9, -0.2]}>
          <boxGeometry args={[0.04, 0.22, 0.56]} />
        </mesh>

        <mesh material={lightMaterial} position={[0.32, 0.42, 0.69]}>
          <boxGeometry args={[0.14, 0.1, 0.04]} />
        </mesh>

        <mesh material={lightMaterial} position={[-0.32, 0.42, 0.69]}>
          <boxGeometry args={[0.14, 0.1, 0.04]} />
        </mesh>

        <mesh material={bodyDarkMaterial} position={[0, 0.32, -0.7]} castShadow>
          <boxGeometry args={[1.2, 0.12, 0.06]} />
        </mesh>
      </group>
    </group>
  );
};
