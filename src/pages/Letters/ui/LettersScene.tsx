import { useFrame } from "@react-three/fiber";
import { Bloom, EffectComposer } from "@react-three/postprocessing";
import * as THREE from "three";
import {
  AREA_HALF_D,
  AREA_HALF_W,
  AREA_HEIGHT,
  CAMERA_MARGIN,
  FLOOR_COLOR,
  FOV,
  LETTER_BG,
  MIN_LETTER_PX,
  WALL_COLOR,
} from "../lib/constants";
import { LettersWorld } from "../lib/types";
import { stepLetters } from "../lib/physics";
import { Letters } from "./Letters";

const WALL_OPACITY = 0.12;

const LettersGameLoop = ({ world }: { world: LettersWorld }) => {
  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.05);

    stepLetters(world, dt);
  });

  return null;
};

const CameraRig = ({ world }: { world: LettersWorld }) => {
  useFrame(({ camera, size }) => {
    const vFov = (FOV * Math.PI) / 180;
    const aspect = size.width / Math.max(1, size.height);
    const distH = AREA_HEIGHT / 2 / Math.tan(vFov / 2);
    const distW = AREA_HALF_W / (Math.tan(vFov / 2) * aspect);
    const camDist = Math.max(distH, distW) * CAMERA_MARGIN;

    camera.position.set(0, AREA_HEIGHT / 2, camDist);
    camera.lookAt(0, AREA_HEIGHT / 2, 0);

    const distToBack = camDist + AREA_HALF_D;
    const visibleHeight = 2 * distToBack * Math.tan(vFov / 2);
    const pxPerWorld = size.height / visibleHeight;

    world.pxPerWorld = pxPerWorld;
    world.letterScale = MIN_LETTER_PX / pxPerWorld;
  });

  return null;
};

const Floor = () => (
  <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
    <planeGeometry args={[AREA_HALF_W * 2, AREA_HALF_D * 2]} />
    <meshStandardMaterial color={FLOOR_COLOR} roughness={0.9} />
  </mesh>
);

const Bounds = () => {
  const wallMaterial = (
    <meshStandardMaterial
      color={WALL_COLOR}
      transparent
      opacity={WALL_OPACITY}
      side={THREE.DoubleSide}
    />
  );

  return (
    <group>
      <mesh position={[-AREA_HALF_W, AREA_HEIGHT / 2, 0]}>
        <boxGeometry args={[0.1, AREA_HEIGHT, AREA_HALF_D * 2]} />
        {wallMaterial}
      </mesh>
      <mesh position={[AREA_HALF_W, AREA_HEIGHT / 2, 0]}>
        <boxGeometry args={[0.1, AREA_HEIGHT, AREA_HALF_D * 2]} />
        {wallMaterial}
      </mesh>
      <mesh position={[0, AREA_HEIGHT / 2, -AREA_HALF_D]}>
        <boxGeometry args={[AREA_HALF_W * 2, AREA_HEIGHT, 0.1]} />
        {wallMaterial}
      </mesh>
      <mesh position={[0, AREA_HEIGHT / 2, AREA_HALF_D]}>
        <boxGeometry args={[AREA_HALF_W * 2, AREA_HEIGHT, 0.1]} />
        {wallMaterial}
      </mesh>
    </group>
  );
};

export const LettersScene = ({ world }: { world: LettersWorld }) => (
  <>
    <color attach="background" args={[LETTER_BG]} />
    <ambientLight intensity={0.55} />
    <directionalLight position={[15, 30, 20]} intensity={1.1} />
    <pointLight position={[0, AREA_HEIGHT + 6, 10]} intensity={0.6} color="#facc15" />

    <Floor />
    <Bounds />
    <Letters world={world} />
    <LettersGameLoop world={world} />
    <CameraRig world={world} />

    <EffectComposer>
      <Bloom intensity={0.7} luminanceThreshold={0.5} mipmapBlur />
    </EffectComposer>
  </>
);
