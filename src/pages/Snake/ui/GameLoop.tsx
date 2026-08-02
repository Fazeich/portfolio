import { useFrame, useThree } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";
import { InputState, WorldState } from "@/lib/types";
import { isGameOver, stepWorld } from "@/lib/physics";
import { resetWorld } from "@/lib/world";
import { $snake3d } from "@/stores/snake3d/snake3d";
import {
  addScore,
  damageSnake,
  gameOver,
  setBoost,
} from "@/stores/snake3d/events";

const forwardVector = new THREE.Vector3();

export const GameLoop = ({
  world,
  inputRef,
}: {
  world: WorldState;
  inputRef: React.RefObject<InputState>;
}) => {
  const { camera } = useThree();
  const prevPhase = useRef($snake3d.getState().phase);
  const lastBoost = useRef(-1);

  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.05);
    const phase = $snake3d.getState().phase;

    if (prevPhase.current !== phase) {
      if (phase === "playing") {
        resetWorld(world);
        lastBoost.current = -1;
      }

      prevPhase.current = phase;
    }

    if (phase !== "playing" || !inputRef.current) {
      return;
    }

    camera.getWorldDirection(forwardVector);

    const result = stepWorld(world, inputRef.current, forwardVector, dt);

    if (result.scoreGained > 0) {
      addScore(result.scoreGained);
    }

    if (result.damageTaken) {
      damageSnake();
    }

    if (isGameOver(world)) {
      gameOver();

      return;
    }

    const roundedBoost = Math.round(world.snake.boost);

    if (roundedBoost !== lastBoost.current) {
      lastBoost.current = roundedBoost;
      setBoost(roundedBoost);
    }
  });

  return null;
};
