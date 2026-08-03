import { Canvas } from "@react-three/fiber";
import { Bloom, EffectComposer } from "@react-three/postprocessing";
import { useMemo } from "react";
import { useTheme } from "styled-components";
import { Arena } from "@/components/Arena";
import { CameraRig } from "@/components/CameraRig";
import { Effects } from "@/components/Effects";
import { Food } from "@/components/Food";
import { Hud } from "@/components/Hud";
import { Screens } from "@/components/Screens";
import { Shards } from "@/components/Shards";
import { Snake } from "@/components/Snake";
import { useInputRef, useKeyboardInput } from "@/lib/hooks";
import { PageWrapper } from "@/lib/styles";
import { WorldState } from "@/lib/types";
import { createWorld } from "@/lib/world";
import { GameLoop } from "./GameLoop";
import { PointerTracker } from "./PointerTracker";

export const SnakePage = () => {
  const theme = useTheme();
  const world = useMemo<WorldState>(() => createWorld(), []);
  const inputRef = useInputRef();

  useKeyboardInput(inputRef);

  return (
    <PageWrapper>
      <Canvas
        camera={{ fov: 60, near: 0.1, far: 300, position: [0, 28, 55] }}
        gl={{ antialias: true, powerPreference: "high-performance" }}
      >
        <color attach="background" args={[theme.arena.background]} />
        <ambientLight intensity={0.55} />
        <directionalLight position={[20, 40, 20]} intensity={1.2} />
        <pointLight position={[0, 25, 0]} intensity={0.5} color="#38bdf8" />

        <Arena />
        <PointerTracker inputRef={inputRef} />
        <GameLoop world={world} inputRef={inputRef} />
        <Snake world={world} />
        <Food world={world} />
        <Shards world={world} />
        <Effects world={world} />
        <CameraRig world={world} />

        <EffectComposer>
          <Bloom intensity={0.7} luminanceThreshold={0.5} mipmapBlur />
        </EffectComposer>
      </Canvas>

      <Hud world={world} />
      <Screens />
    </PageWrapper>
  );
};
