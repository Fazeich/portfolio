import { useEffect, useRef } from "react";
import { createInput } from "@/lib/world";
import { InputState } from "@/lib/types";

export const useInputRef = () => {
  const inputRef = useRef<InputState | null>(null);

  if (inputRef.current === null) {
    inputRef.current = createInput();
  }

  return inputRef;
};

export const useKeyboardInput = (
  inputRef: React.RefObject<InputState>,
): void => {
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const input = inputRef.current;

      if (!input) {
        return;
      }

      switch (e.code) {
        case "KeyW":
        case "ArrowUp":
          input.wasdDir.z = 1;
          break;
        case "KeyS":
        case "ArrowDown":
          input.wasdDir.z = -1;
          break;
        case "KeyA":
        case "ArrowLeft":
          input.wasdDir.x = -1;
          break;
        case "KeyD":
        case "ArrowRight":
          input.wasdDir.x = 1;
          break;
        case "Space":
          input.boosting = true;
          e.preventDefault();
          break;
        default:
          break;
      }
    };

    const onKeyUp = (e: KeyboardEvent) => {
      const input = inputRef.current;

      if (!input) {
        return;
      }

      switch (e.code) {
        case "KeyW":
        case "ArrowUp":
          if (input.wasdDir.z === 1) {
            input.wasdDir.z = 0;
          }
          break;
        case "KeyS":
        case "ArrowDown":
          if (input.wasdDir.z === -1) {
            input.wasdDir.z = 0;
          }
          break;
        case "KeyA":
        case "ArrowLeft":
          if (input.wasdDir.x === -1) {
            input.wasdDir.x = 0;
          }
          break;
        case "KeyD":
        case "ArrowRight":
          if (input.wasdDir.x === 1) {
            input.wasdDir.x = 0;
          }
          break;
        case "Space":
          input.boosting = false;
          break;
        default:
          break;
      }
    };

    const onBlur = () => {
      const input = inputRef.current;

      if (!input) {
        return;
      }

      input.wasdDir.x = 0;
      input.wasdDir.z = 0;
      input.boosting = false;
    };

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    window.addEventListener("blur", onBlur);

    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      window.removeEventListener("blur", onBlur);
    };
  }, [inputRef]);
};
