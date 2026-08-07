import { Canvas } from "@react-three/fiber";
import { useEffect, useMemo, useReducer } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import { PageWrapper } from "@/lib/styles";
import { createLettersWorld, spawnLetter } from "../lib/world";
import { letterTyped } from "@/stores/letters/events";
import { LettersScene } from "./LettersScene";
import { FOV } from "../lib/constants";

const BackButton = styled.button`
  position: fixed;
  top: 18px;
  left: 18px;
  z-index: 30;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 9px 16px;
  font-family: "Exo 2", sans-serif;
  font-size: 14px;
  font-weight: 700;
  color: ${({ theme }) => theme.ui.text};
  background: ${({ theme }) => theme.ui.panel};
  border: 1px solid ${({ theme }) => theme.ui.panelBorder};
  border-radius: 999px;
  cursor: pointer;
  transition: transform 0.15s, box-shadow 0.15s;

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 0 18px rgba(56, 189, 248, 0.4);
  }
`;

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
      <BackButton onClick={() => navigate("/")}>← Назад</BackButton>
      <Canvas
        camera={{ fov: FOV, near: 0.1, far: 300 }}
        gl={{ antialias: true, powerPreference: "high-performance" }}
      >
        <LettersScene world={world} />
      </Canvas>
    </PageWrapper>
  );
};
