import { Canvas } from "@react-three/fiber";
import { useEffect, useMemo, useReducer } from "react";
import { useNavigate } from "react-router-dom";
import { PageWrapper } from "@/lib/styles";
import { createLettersWorld, spawnLetter } from "../lib/world";
import { letterTyped } from "@/stores/letters/events";
import { LettersScene } from "./LettersScene";
import { FOV } from "../lib/constants";

export const LettersPage = () => {
  const navigate = useNavigate();
  const world = useMemo(() => createLettersWorld(), []);
  const [, bump] = useReducer((value: number) => value + 1, 0);

  useEffect(() => {
    const unTyped = letterTyped.watch((char) => {
      spawnLetter(world, char);
      bump();
    });

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.isComposing) {
        return;
      }

      if (e.key === "Escape") {
        navigate("/");

        return;
      }

      if (
        e.key.length === 1 &&
        e.key.trim().length > 0 &&
        !e.ctrlKey &&
        !e.metaKey &&
        !e.altKey
      ) {
        e.preventDefault();
        letterTyped(e.key);
      }
    };

    window.addEventListener("keydown", onKeyDown);

    return () => {
      unTyped();
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [navigate, world, bump]);

  return (
    <PageWrapper>
      <Canvas
        camera={{ fov: FOV, near: 0.1, far: 300 }}
        gl={{ antialias: true, powerPreference: "high-performance" }}
      >
        <LettersScene world={world} />
      </Canvas>
    </PageWrapper>
  );
};
