import { useCallback, useEffect, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Canvas } from "@react-three/fiber";
import { InteractionTooltip } from "./InteractionTooltip";
import { TownScene } from "../lib/TownScene";
import { createTownState, TownState } from "../lib/state";
import { bindControls } from "../lib/controls";
import { ANIMATION_DURATION, CAMERA_BACK, CAMERA_HEIGHT } from "../lib/constants";

const WhiteFadeOverlay = ({ state }: { state: TownState }) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let raf = 0;

    const tick = () => {
      const el = ref.current;

      if (el) {
        if (state.interacting) {
          const t = state.interactionTimer / ANIMATION_DURATION;

          if (t > 0.72) {
            el.style.opacity = String(Math.min(1, (t - 0.72) / 0.28));
          } else {
            el.style.opacity = "0";
          }
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
        background: "#ffffff",
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

  useEffect(() => {
    const unbind = bindControls();

    return unbind;
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
        background: "#2d5a27",
      }}
    >
      <Canvas
        shadows
        camera={{ fov: 45, near: 0.1, far: 120, position: [0, CAMERA_HEIGHT, CAMERA_BACK] }}
      >
        <TownScene state={state} onNavigate={handleNavigate} />
      </Canvas>

      <InteractionTooltip getState={getTooltip} />
      <WhiteFadeOverlay state={state} />
    </div>
  );
};
