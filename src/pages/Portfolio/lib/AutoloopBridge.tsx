import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import {
  AutoloopStats,
  autoloopRuntime,
  isAutoloopEnabled,
  readAutoloopSeed,
  setAutoloopSeed,
} from "@/lib/autoloop";
import { TownState } from "./state";

export const AutoloopBridge = ({ state }: { state: TownState }) => {
  const gl = useThree((three) => three.gl);
  const frameCount = useRef(0);
  const elapsed = useRef(0);
  const fps = useRef(0);

  useFrame((_, delta) => {
    frameCount.current += 1;
    elapsed.current += delta;

    if (elapsed.current >= 1) {
      fps.current = frameCount.current / elapsed.current;
      frameCount.current = 0;
      elapsed.current = 0;
    }
  });

  useEffect(() => {
    if (!isAutoloopEnabled()) {
      return;
    }

    autoloopRuntime.enabled = true;
    setAutoloopSeed(readAutoloopSeed());

    window.__autoloop = {
      freeze: (frozen) => {
        autoloopRuntime.frozen = frozen;
      },
      hideHud: (hidden) => {
        autoloopRuntime.hudHidden = hidden;
        document.documentElement.classList.toggle("autoloop-hide-hud", hidden);
      },
      setSeed: (seed) => {
        setAutoloopSeed(seed);
      },
      setPlayer: (player) => {
        if (
          !Number.isFinite(player.x) ||
          !Number.isFinite(player.z) ||
          (player.facing !== undefined && !Number.isFinite(player.facing))
        ) {
          return;
        }

        state.player.x = player.x;
        state.player.z = player.z;

        if (typeof player.facing === "number") {
          state.player.facing = player.facing;
        }
      },
      stats: (): AutoloopStats => ({
        fps: fps.current,
        drawCalls: gl.info.render.calls,
        triangles: gl.info.render.triangles,
      }),
    };

    return () => {
      autoloopRuntime.enabled = false;
      autoloopRuntime.frozen = false;
      document.documentElement.classList.remove("autoloop-hide-hud");
      delete window.__autoloop;
    };
  }, [gl, state]);

  return null;
};
