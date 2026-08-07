import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";
import {
  BLEND_SPEED,
  BOB_AMPLITUDE,
  HEAD_SWAY,
  PLAYER_RADIUS,
  PLAYER_SPAWN,
  PLAYER_SPEED,
  TURN_SPEED,
  WALK_CYCLE_SPEED,
} from "./constants";
import { TownState } from "./state";
import { pollControls } from "./controls";
import { clampToRoom, resolveObstacles } from "./physics";
import { stepInteraction, tryStartInteraction } from "./interaction";

const ROBE = "#4a5fd0";
const ROBE_DARK = "#3b4bb5";
const ROBE_TRIM = "#eab308";
const SKIN = "#d9b38c";
const EYE = "#ffcf8a";
const BOOK = "#8a2f2f";
const BOOK_PAGE = "#f5efe8";
const FEET = "#2f2b26";

const CHARACTER_SCALE = 1.4;

const ARM_SWING = 0.38;
const LEG_SWING = 0.3;
const FOREARM_BEND = 0.22;
const FOREARM_WALK = 0.2;
const SPINE_FORWARD = 0.06;

const lerp = (a: number, b: number, t: number): number => a + (b - a) * t;

const lerpAngle = (a: number, b: number, t: number): number => {
  const diff = Math.atan2(Math.sin(b - a), Math.cos(b - a));

  return a + diff * t;
};

const robeMaterial = new THREE.MeshStandardMaterial({
  color: ROBE,
  roughness: 0.85,
});

const robeDarkMaterial = new THREE.MeshStandardMaterial({
  color: ROBE_DARK,
  roughness: 0.85,
});

const trimMaterial = new THREE.MeshStandardMaterial({
  color: ROBE_TRIM,
  roughness: 0.4,
  metalness: 0.2,
});

const skinMaterial = new THREE.MeshStandardMaterial({
  color: SKIN,
  roughness: 0.7,
});

const eyeMaterial = new THREE.MeshStandardMaterial({
  color: EYE,
  emissive: EYE,
  emissiveIntensity: 1.8,
  roughness: 0.3,
});

const bookMaterial = new THREE.MeshStandardMaterial({
  color: BOOK,
  roughness: 0.8,
});

const pageMaterial = new THREE.MeshStandardMaterial({
  color: BOOK_PAGE,
  roughness: 0.9,
});

const feetMaterial = new THREE.MeshStandardMaterial({
  color: FEET,
  roughness: 0.9,
});

export const CharacterModel = ({
  state,
  onNavigate,
}: {
  state: TownState;
  onNavigate: (path: string) => void;
}) => {
  const bodyRef = useRef<THREE.Group>(null);
  const bobRef = useRef<THREE.Group>(null);
  const skirtRef = useRef<THREE.Group>(null);
  const torsoRef = useRef<THREE.Group>(null);
  const headRef = useRef<THREE.Group>(null);
  const rShoulderRef = useRef<THREE.Group>(null);
  const lShoulderRef = useRef<THREE.Group>(null);
  const rElbowRef = useRef<THREE.Group>(null);
  const lElbowRef = useRef<THREE.Group>(null);
  const rHipRef = useRef<THREE.Group>(null);
  const lHipRef = useRef<THREE.Group>(null);
  const navigateRef = useRef(onNavigate);
  const currentFacing = useRef(Math.PI);
  navigateRef.current = onNavigate;

  useFrame(({ clock }, delta) => {
    const dt = Math.min(delta, 0.05);
    const player = state.player;
    const t = clock.getElapsedTime();

    if (stepInteraction(state, dt, navigateRef.current)) {
      return;
    }

    const ctrl = pollControls();
    const moving = ctrl.moveDir.x !== 0 || ctrl.moveDir.z !== 0;

    if (ctrl.interact && tryStartInteraction(state)) {
      return;
    }

    if (moving) {
      player.x += ctrl.moveDir.x * PLAYER_SPEED * dt;
      player.z += ctrl.moveDir.z * PLAYER_SPEED * dt;

      clampToRoom(player);
      resolveObstacles(player, PLAYER_RADIUS);

      player.targetWalkPhase += WALK_CYCLE_SPEED * dt;
      player.moving = true;
    } else {
      player.targetWalkPhase = 0;
      player.moving = false;
    }

    const blend = 1 - Math.exp(-BLEND_SPEED * dt);
    player.walkPhase = lerp(player.walkPhase, player.targetWalkPhase, blend);

    if (bodyRef.current) {
      const targetFacing = moving
        ? Math.atan2(ctrl.moveDir.x, ctrl.moveDir.z)
        : currentFacing.current;

      const turn = 1 - Math.exp(-TURN_SPEED * dt);
      currentFacing.current = lerpAngle(currentFacing.current, targetFacing, turn);

      const bob = moving
        ? Math.abs(Math.sin(player.walkPhase * Math.PI * 2)) * BOB_AMPLITUDE
        : 0;

      bodyRef.current.position.set(player.x, 0, player.z);
      bodyRef.current.rotation.y = currentFacing.current;

      if (bobRef.current) {
        bobRef.current.position.y = bob;
      }
    }

    const phase = player.walkPhase * Math.PI * 2;
    const swing = moving ? Math.sin(phase) : 0;
    const idle = Math.sin(t * 1.6) * 0.05;

    if (rShoulderRef.current) {
      rShoulderRef.current.rotation.set(moving ? -swing * ARM_SWING : idle, 0, 0);
    }

    if (lShoulderRef.current) {
      lShoulderRef.current.rotation.set(moving ? swing * ARM_SWING : -idle, 0, 0);
    }

    const elbowBend = moving
      ? FOREARM_BEND + Math.max(0, swing) * FOREARM_WALK
      : FOREARM_BEND * 0.8;

    if (rElbowRef.current) {
      rElbowRef.current.rotation.x = -elbowBend;
    }

    if (lElbowRef.current) {
      lElbowRef.current.rotation.x = -elbowBend;
    }

    if (rHipRef.current) {
      rHipRef.current.rotation.x = moving ? swing * LEG_SWING : 0;
    }

    if (lHipRef.current) {
      lHipRef.current.rotation.x = moving ? -swing * LEG_SWING : 0;
    }

    if (skirtRef.current) {
      skirtRef.current.rotation.z = moving
        ? swing * 0.06
        : Math.sin(t * 1.2) * 0.02;
    }

    if (torsoRef.current) {
      torsoRef.current.rotation.x = lerp(
        torsoRef.current.rotation.x,
        moving ? SPINE_FORWARD : 0,
        blend,
      );
    }

    if (headRef.current) {
      headRef.current.rotation.x = -swing * HEAD_SWAY;
    }
  });

  return (
    <group
      ref={bodyRef}
      position={[PLAYER_SPAWN.x, 0, PLAYER_SPAWN.z]}
    >
      <group ref={bobRef} scale={CHARACTER_SCALE}>
        <group ref={skirtRef}>
          <group ref={rHipRef} position={[0.14, 0.34, 0]}>
            <mesh
              material={feetMaterial}
              position={[0, -0.24, 0.02]}
              castShadow
            >
              <boxGeometry args={[0.16, 0.16, 0.3]} />
            </mesh>
          </group>

          <group ref={lHipRef} position={[-0.14, 0.34, 0]}>
            <mesh
              material={feetMaterial}
              position={[0, -0.24, 0.02]}
              castShadow
            >
              <boxGeometry args={[0.16, 0.16, 0.3]} />
            </mesh>
          </group>

          <mesh material={robeMaterial} position={[0, 0.42, 0]} castShadow>
            <boxGeometry args={[0.56, 0.28, 0.4]} />
          </mesh>
          <mesh material={robeMaterial} position={[0, 0.62, 0]} castShadow>
            <boxGeometry args={[0.5, 0.26, 0.36]} />
          </mesh>
          <mesh material={robeDarkMaterial} position={[0, 0.82, 0]} castShadow>
            <boxGeometry args={[0.44, 0.24, 0.32]} />
          </mesh>
          <mesh material={trimMaterial} position={[0, 0.95, 0]} castShadow>
            <boxGeometry args={[0.46, 0.08, 0.34]} />
          </mesh>
        </group>

        <group ref={torsoRef}>
          <mesh material={robeDarkMaterial} position={[0, 1.12, 0]} castShadow>
            <boxGeometry args={[0.4, 0.26, 0.28]} />
          </mesh>

          <group ref={rShoulderRef} position={[0.23, 1.22, 0]}>
            <mesh material={robeMaterial} position={[0, -0.16, 0]} castShadow>
              <boxGeometry args={[0.16, 0.32, 0.18]} />
            </mesh>

            <group ref={rElbowRef} position={[0, -0.32, 0]}>
              <mesh material={robeDarkMaterial} position={[0, -0.11, 0]} castShadow>
                <boxGeometry args={[0.18, 0.22, 0.2]} />
              </mesh>
              <mesh material={skinMaterial} position={[0, -0.24, 0]} castShadow>
                <boxGeometry args={[0.13, 0.13, 0.13]} />
              </mesh>
            </group>
          </group>

          <group ref={lShoulderRef} position={[-0.23, 1.22, 0]}>
            <mesh material={robeMaterial} position={[0, -0.16, 0]} castShadow>
              <boxGeometry args={[0.16, 0.32, 0.18]} />
            </mesh>

            <group ref={lElbowRef} position={[0, -0.32, 0]}>
              <mesh material={robeDarkMaterial} position={[0, -0.11, 0]} castShadow>
                <boxGeometry args={[0.18, 0.22, 0.2]} />
              </mesh>
              <mesh material={skinMaterial} position={[0, -0.24, 0]} castShadow>
                <boxGeometry args={[0.13, 0.13, 0.13]} />
              </mesh>

              <group position={[0, -0.24, 0.1]}>
                <mesh material={bookMaterial} position={[0, -0.12, 0]} castShadow>
                  <boxGeometry args={[0.2, 0.26, 0.09]} />
                </mesh>
                <mesh material={pageMaterial} position={[0, -0.12, 0.045]}>
                  <boxGeometry args={[0.16, 0.22, 0.02]} />
                </mesh>
              </group>
            </group>
          </group>

          <group ref={headRef} position={[0, 1.36, 0]}>
            <mesh material={robeDarkMaterial} position={[0, 0, 0]} castShadow>
              <boxGeometry args={[0.26, 0.24, 0.26]} />
            </mesh>
            <mesh material={robeMaterial} position={[0, 0.02, -0.03]} castShadow>
              <boxGeometry args={[0.3, 0.28, 0.3]} />
            </mesh>
            <mesh material={eyeMaterial} position={[0.055, 0.02, 0.13]}>
              <boxGeometry args={[0.04, 0.06, 0.02]} />
            </mesh>
            <mesh material={eyeMaterial} position={[-0.055, 0.02, 0.13]}>
              <boxGeometry args={[0.04, 0.06, 0.02]} />
            </mesh>
          </group>
        </group>
      </group>
    </group>
  );
};
