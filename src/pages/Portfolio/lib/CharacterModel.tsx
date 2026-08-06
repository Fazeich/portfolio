import { useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { clone as cloneSkeleton } from "three/examples/jsm/utils/SkeletonUtils.js";
import {
  ALTARS,
  ANIMATION_DURATION,
  BLEND_SPEED,
  BOB_AMPLITUDE,
  HALF_D,
  HALF_W,
  HEAD_SWAY,
  INTERACTION_RADIUS,
  PELVIS_SWAY,
  PLAYER_MARGIN,
  PLAYER_RADIUS,
  PLAYER_SPAWN,
  PLAYER_SPEED,
  SHOULDER_SHRUG,
  SPINE_FORWARD,
  SPINE_SWAY,
  TURN_SPEED,
  WALK_CYCLE_SPEED,
} from "./constants";
import { TownState } from "./state";
import { pollControls } from "./controls";
import modelUrl from "./assets/character/character.gltf?url";

const BONES = {
  pelvis: "Bip001_Pelvis_01",
  spine1: "Bip001_Spine_02",
  spine2: "Bip001_Spine1_03",
  head: "Bip001_Head_05",
  lThigh: "Bip001_L_Thigh",
  rThigh: "Bip001_R_Thigh",
  lCalf: "Bip001_L_Calf",
  rCalf: "Bip001_R_Calf",
  lArm: "Bip001_L_UpperArm",
  rArm: "Bip001_R_UpperArm",
  lForearm: "Bip001_L_Forearm",
  rForearm: "Bip001_R_Forearm",
} as const;

const CHARACTER_HEIGHT = 1.3;

const THIGH_SWING_FWD = 0.26;
const THIGH_SWING_BACK = 0.4;
const CALF_BEND = 0.68;
const ARM_SWING = 0.3;
const ARM_ADDUCT = 0.2;
const FOREARM_BEND = 0.5;
const FOREARM_BASE = 0.42;
const ARM_RAISE = Math.PI * 0.6;
const FACING_BIAS = 0;

type BoneKey = keyof typeof BONES;
type BoneRefs = Partial<Record<BoneKey, THREE.Object3D>>;

const groupQ = new THREE.Quaternion();
const parentQ = new THREE.Quaternion();
const invParentQ = new THREE.Quaternion();
const walkAxis = new THREE.Vector3();
const raiseAxis = new THREE.Vector3();
const deltaWorld = new THREE.Quaternion();
const deltaLocal = new THREE.Quaternion();
const combinedQ = new THREE.Quaternion();
const shrugQ = new THREE.Quaternion();

const lerp = (a: number, b: number, t: number): number => a + (b - a) * t;

const lerpAngle = (a: number, b: number, t: number): number => {
  const diff = Math.atan2(Math.sin(b - a), Math.cos(b - a));
  return a + diff * t;
};

const apply = (
  bone: THREE.Object3D | undefined,
  baseQuat: THREE.Quaternion | undefined,
  axis: THREE.Vector3,
  angle: number,
): void => {
  if (!bone || !baseQuat) {
    return;
  }

  if (angle === 0) {
    return;
  }

  if (bone.parent) {
    bone.parent.getWorldQuaternion(parentQ);
  } else {
    parentQ.identity();
  }

  deltaWorld.setFromAxisAngle(axis, angle);
  invParentQ.copy(parentQ).invert();
  deltaLocal.copy(invParentQ).multiply(deltaWorld).multiply(parentQ);
  bone.quaternion.premultiply(deltaLocal);
};

export const CharacterModel = ({
  state,
  onNavigate,
}: {
  state: TownState;
  onNavigate: (path: string) => void;
}) => {
  const { scene } = useGLTF(modelUrl);
  const groupRef = useRef<THREE.Group>(null);
  const ringRef = useRef<THREE.Mesh>(null);
  const auraRef = useRef<THREE.PointLight>(null);
  const navigateRef = useRef(onNavigate);
  const currentFacing = useRef(0);
  navigateRef.current = onNavigate;

  const prepared = useMemo(() => {
    const model = cloneSkeleton(scene);

    const box = new THREE.Box3().setFromObject(model);
    const h = Math.max(0.001, box.max.y - box.min.y);
    const scale = CHARACTER_HEIGHT / h;

    model.scale.setScalar(scale);
    model.updateMatrixWorld(true);

    const box2 = new THREE.Box3().setFromObject(model);
    const feetY = -box2.min.y;

    model.traverse((o) => {
      if ((o as THREE.Mesh).isMesh) {
        o.castShadow = true;
      }
    });

    const bones: BoneRefs = {};
    const baseQuats: Partial<Record<BoneKey, THREE.Quaternion>> = {};

    model.traverse((o) => {
      for (const key of Object.keys(BONES) as BoneKey[]) {
        if (!bones[key] && o.name.startsWith(BONES[key])) {
          bones[key] = o;
          baseQuats[key] = o.quaternion.clone();
        }
      }
    });

    return { model, feetY, bones, baseQuats };
  }, [scene]);

  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.05);
    const player = state.player;
    const { feetY, bones, baseQuats } = prepared;

    if (groupRef.current) {
      groupRef.current.getWorldQuaternion(groupQ);
    } else {
      groupQ.identity();
    }

    walkAxis.set(1, 0, 0).applyQuaternion(groupQ);
    raiseAxis.set(0, 0, 1).applyQuaternion(groupQ);

    if (state.interacting) {
      state.interactionTimer += dt;
      const t = state.interactionTimer / ANIMATION_DURATION;

      const raise = ARM_RAISE * Math.min(1, t / 0.35);

      if (bones.lArm && baseQuats.lArm) {
        bones.lArm.quaternion.copy(baseQuats.lArm);
        apply(bones.lArm, baseQuats.lArm, raiseAxis, raise);
      }
      if (bones.rArm && baseQuats.rArm) {
        bones.rArm.quaternion.copy(baseQuats.rArm);
        apply(bones.rArm, baseQuats.rArm, raiseAxis, -raise);
      }

      if (ringRef.current) {
        const ringScale =
          t < 0.5 ? 0.5 + t * 13 : Math.max(0.05, 7 - (t - 0.5) * 13);
        const opacity =
          t < 0.1 ? t / 0.1 : t < 0.45 ? 1 : Math.max(0, 1 - (t - 0.45) / 0.3);

        ringRef.current.scale.setScalar(ringScale);
        (ringRef.current.material as THREE.MeshBasicMaterial).opacity = opacity;
      }

      if (auraRef.current) {
        auraRef.current.intensity = t < 0.5 ? 4 : 0;
      }

      if (state.interactionTimer >= ANIMATION_DURATION) {
        navigateRef.current(state.interactionTarget);
      }

      return;
    }

    const ctrl = pollControls();
    const moving = ctrl.moveDir.x !== 0 || ctrl.moveDir.z !== 0;

    if (moving) {
      const nx = player.x + ctrl.moveDir.x * PLAYER_SPEED * dt;
      const nz = player.z + ctrl.moveDir.z * PLAYER_SPEED * dt;

      player.x = Math.max(
        -HALF_W + PLAYER_MARGIN,
        Math.min(HALF_W - PLAYER_MARGIN, nx),
      );
      player.z = Math.max(
        -HALF_D + PLAYER_MARGIN,
        Math.min(HALF_D - PLAYER_MARGIN, nz),
      );

      resolveAltarCollision(player);

      player.targetWalkPhase += WALK_CYCLE_SPEED * dt;
      player.moving = true;
    } else {
      player.targetWalkPhase = 0;
      player.moving = false;
    }

    const blendFactor = 1 - Math.exp(-BLEND_SPEED * dt);
    player.walkPhase = lerp(
      player.walkPhase,
      player.targetWalkPhase,
      blendFactor,
    );

    if (groupRef.current) {
      const targetFacing = moving
        ? Math.atan2(ctrl.moveDir.x, ctrl.moveDir.z)
        : currentFacing.current;

      const turnFactor = 1 - Math.exp(-TURN_SPEED * dt);
      currentFacing.current = lerpAngle(
        currentFacing.current,
        targetFacing,
        turnFactor,
      );

      const bob = moving
        ? Math.abs(Math.sin(player.walkPhase * Math.PI * 2)) * BOB_AMPLITUDE
        : 0;

      groupRef.current.position.set(player.x, feetY + bob, player.z);
      groupRef.current.rotation.y = currentFacing.current + FACING_BIAS;
    }

    if (ctrl.interact) {
      let nearest = -1;
      let nearestDist = INTERACTION_RADIUS;

      for (let i = 0; i < ALTARS.length; i += 1) {
        const altar = ALTARS[i];
        const ax = player.x - altar.position.x;
        const az = player.z - altar.position.z;
        const dist = Math.sqrt(ax * ax + az * az);

        if (dist < nearestDist) {
          nearestDist = dist;
          nearest = i;
        }
      }

      if (nearest >= 0) {
        state.interacting = true;
        state.interactionTimer = 0;
        state.interactionTarget = ALTARS[nearest].target;

        return;
      }
    }

    const phase = player.walkPhase * Math.PI * 2;
    const swing = playing(moving, phase);

    if (bones.pelvis && baseQuats.pelvis) {
      bones.pelvis.quaternion.copy(baseQuats.pelvis);
      apply(bones.pelvis, baseQuats.pelvis, walkAxis, swing * PELVIS_SWAY);
    }

    const spineSwayAngle = -swing * SPINE_SWAY;
    const spineForwardAngle = player.moving ? SPINE_FORWARD : 0;

    if (bones.spine1 && baseQuats.spine1) {
      bones.spine1.quaternion.copy(baseQuats.spine1);
      apply(
        bones.spine1,
        baseQuats.spine1,
        walkAxis,
        spineSwayAngle + spineForwardAngle,
      );
    }

    if (bones.spine2 && baseQuats.spine2) {
      bones.spine2.quaternion.copy(baseQuats.spine2);
      apply(
        bones.spine2,
        baseQuats.spine2,
        walkAxis,
        -swing * SPINE_SWAY * 0.7,
      );
    }

    if (bones.head && baseQuats.head) {
      bones.head.quaternion.copy(baseQuats.head);
      apply(bones.head, baseQuats.head, walkAxis, -swing * HEAD_SWAY);
    }

    if (bones.lThigh && baseQuats.lThigh) {
      bones.lThigh.quaternion.copy(baseQuats.lThigh);
      apply(bones.lThigh, baseQuats.lThigh, walkAxis, thighAngle(swing));
    }

    if (bones.rThigh && baseQuats.rThigh) {
      bones.rThigh.quaternion.copy(baseQuats.rThigh);
      apply(bones.rThigh, baseQuats.rThigh, walkAxis, thighAngle(-swing));
    }

    const lCalfAngle = Math.max(0, Math.sin(phase + 0.5)) * CALF_BEND;
    const rCalfAngle = Math.max(0, -Math.sin(phase + 0.5)) * CALF_BEND;

    if (bones.lCalf && baseQuats.lCalf) {
      bones.lCalf.quaternion.copy(baseQuats.lCalf);
      apply(bones.lCalf, baseQuats.lCalf, walkAxis, lCalfAngle);
    }

    if (bones.rCalf && baseQuats.rCalf) {
      bones.rCalf.quaternion.copy(baseQuats.rCalf);
      apply(bones.rCalf, baseQuats.rCalf, walkAxis, rCalfAngle);
    }

    if (bones.lArm && baseQuats.lArm) {
      bones.lArm.quaternion.copy(baseQuats.lArm);
      apply(bones.lArm, baseQuats.lArm, raiseAxis, -ARM_ADDUCT);

      if (player.moving) {
        combinedQ.setFromAxisAngle(walkAxis, -swing * ARM_SWING);
        shrugQ.setFromAxisAngle(raiseAxis, swing * SHOULDER_SHRUG);
        combinedQ.multiply(shrugQ);

        applyCombined(bones.lArm, combinedQ);
      }
    }

    if (bones.rArm && baseQuats.rArm) {
      bones.rArm.quaternion.copy(baseQuats.rArm);
      apply(bones.rArm, baseQuats.rArm, raiseAxis, ARM_ADDUCT);

      if (player.moving) {
        combinedQ.setFromAxisAngle(walkAxis, swing * ARM_SWING);
        shrugQ.setFromAxisAngle(raiseAxis, -swing * SHOULDER_SHRUG);
        combinedQ.multiply(shrugQ);

        applyCombined(bones.rArm, combinedQ);
      }
    }

    const lForearmAngle =
      (player.moving ? FOREARM_BASE : 0) + Math.max(0, swing) * FOREARM_BEND;
    const rForearmAngle =
      (player.moving ? FOREARM_BASE : 0) + Math.max(0, -swing) * FOREARM_BEND;

    if (bones.lForearm && baseQuats.lForearm) {
      bones.lForearm.quaternion.copy(baseQuats.lForearm);
      apply(bones.lForearm, baseQuats.lForearm, walkAxis, -lForearmAngle);
    }

    if (bones.rForearm && baseQuats.rForearm) {
      bones.rForearm.quaternion.copy(baseQuats.rForearm);
      apply(bones.rForearm, baseQuats.rForearm, walkAxis, -rForearmAngle);
    }

    if (ringRef.current) {
      ringRef.current.scale.setScalar(0.01);
    }

    if (auraRef.current) {
      auraRef.current.intensity = 0;
    }
  });

  return (
    <group
      ref={groupRef}
      position={[PLAYER_SPAWN.x, prepared.feetY, PLAYER_SPAWN.z]}
    >
      <primitive object={prepared.model} />

      <mesh
        ref={ringRef}
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0.06, 0]}
        scale={0.01}
      >
        <ringGeometry args={[0.9, 1, 48]} />
        <meshBasicMaterial
          color="#fbbf24"
          transparent
          opacity={0}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>

      <pointLight
        ref={auraRef}
        position={[0, 2, 0]}
        intensity={0}
        distance={12}
        color="#fbbf24"
      />
    </group>
  );
};

const playing = (moving: boolean, phase: number): number => {
  return moving ? Math.sin(phase) : 0;
};

const thighAngle = (s: number): number => {
  return s > 0 ? s * THIGH_SWING_FWD : s * THIGH_SWING_BACK;
};

const resolveAltarCollision = (player: TownState["player"]): void => {
  for (const altar of ALTARS) {
    const minX = altar.position.x - altar.halfW;
    const maxX = altar.position.x + altar.halfW;
    const minZ = altar.position.z - altar.halfD;
    const maxZ = altar.position.z + altar.halfD;

    const cx = Math.max(minX, Math.min(maxX, player.x));
    const cz = Math.max(minZ, Math.min(maxZ, player.z));

    const dx = player.x - cx;
    const dz = player.z - cz;
    const distSq = dx * dx + dz * dz;
    const minDist = PLAYER_RADIUS;

    if (distSq >= minDist * minDist) {
      continue;
    }

    if (distSq > 0.0001) {
      const dist = Math.sqrt(distSq);
      player.x += (dx / dist) * (minDist - dist);
      player.z += (dz / dist) * (minDist - dist);

      continue;
    }

    const left = player.x - minX;
    const right = maxX - player.x;
    const top = player.z - minZ;
    const bottom = maxZ - player.z;
    const nearest = Math.min(left, right, top, bottom);

    if (nearest === left) {
      player.x = minX - minDist;
    } else if (nearest === right) {
      player.x = maxX + minDist;
    } else if (nearest === top) {
      player.z = minZ - minDist;
    } else {
      player.z = maxZ + minDist;
    }
  }
};

const applyCombined = (
  bone: THREE.Object3D,
  worldDelta: THREE.Quaternion,
): void => {
  if (bone.parent) {
    bone.parent.getWorldQuaternion(parentQ);
  } else {
    parentQ.identity();
  }

  invParentQ.copy(parentQ).invert();
  deltaLocal.copy(invParentQ).multiply(worldDelta).multiply(parentQ);
  bone.quaternion.premultiply(deltaLocal);
};
