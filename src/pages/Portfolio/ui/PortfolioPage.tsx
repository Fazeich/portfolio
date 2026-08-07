import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "styled-components";
import { Canvas } from "@react-three/fiber";
import { Bloom, EffectComposer, Vignette } from "@react-three/postprocessing";
import { InteractionTooltip } from "./InteractionTooltip";
import { HubHud } from "./HubHud";
import { TownScene } from "../lib/TownScene";
import { CharacterId, createTownState, TownState } from "../lib/state";
import { bindControls } from "../lib/controls";
import {
  ANIMATION_DURATION,
  CAMERA_BACK,
  CAMERA_FOV,
  CAMERA_HEIGHT,
} from "../lib/constants";

const WhiteFadeOverlay = ({ state }: { state: TownState }) => {
  const ref = useRef<HTMLDivElement>(null);
  const theme = useTheme();

  useEffect(() => {
    let raf = 0;

    const tick = () => {
      const el = ref.current;

      if (el) {
        if (state.interacting) {
          const t = state.interactionTimer / ANIMATION_DURATION;
          const fade = Math.max(0, Math.min(1, (t - 0.25) / 0.7));

          el.style.opacity = String(fade);
        } else {
          el.style.opacity = "0";
        }
      }

      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);

    return () => cancelAnimationFrame(raf);
  }, [state]);

  return (
    <div
      ref={ref}
      style={{
        position: "fixed",
        inset: 0,
        background: theme.town.fade,
        opacity: 0,
        pointerEvents: "none",
        zIndex: 30,
      }}
    />
  );
};

export const PortfolioPage = () => {
  const navigate = useNavigate();
  const state = useMemo(() => createTownState(), []);
  const [character, setCharacter] = useState<CharacterId>("car");

  useEffect(() => {
    const unbind = bindControls();

    return unbind;
  }, []);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Digit1") {
        setCharacter((current) => (current === "mage" ? "car" : "mage"));
      }
    };

    window.addEventListener("keydown", onKeyDown);

    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const handleNavigate = useCallback(
    (path: string) => {
      navigate(path);
    },
    [navigate],
  );

  const getTooltip = useCallback(() => state.tooltip, [state]);

  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        overflow: "hidden",
        position: "relative",
        background: "#e8e4da",
      }}
    >
      <Canvas
        shadows
        camera={{
          fov: CAMERA_FOV,
          near: 0.1,
          far: 600,
          position: [0, CAMERA_HEIGHT, CAMERA_BACK],
        }}
        gl={{ antialias: true, powerPreference: "high-performance" }}
      >
        <TownScene state={state} character={character} onNavigate={handleNavigate} />

        <EffectComposer>
          <Bloom
            intensity={0.7}
            luminanceThreshold={0.7}
            luminanceSmoothing={0.4}
            mipmapBlur
          />
          <Vignette offset={0.18} darkness={0.42} />
        </EffectComposer>
      </Canvas>

      <HubHud />
      <InteractionTooltip getState={getTooltip} />
      <WhiteFadeOverlay state={state} />
    </div>
  );
};
