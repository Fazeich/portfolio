export interface ControlState {
  moveDir: { x: number; z: number };
  interact: boolean;
}

const held = new Set<string>();
let interactJustPressed = false;

const movementCodes = new Set([
  "KeyW",
  "KeyA",
  "KeyS",
  "KeyD",
  "ArrowUp",
  "ArrowDown",
  "ArrowLeft",
  "ArrowRight",
]);

const keyHandler = (down: boolean) => (e: KeyboardEvent) => {
  const code = e.code;

  if (code === "KeyE" && down) {
    interactJustPressed = true;
  }

  if (movementCodes.has(code)) {
    if (down) {
      held.add(code);
    } else {
      held.delete(code);
    }
  }
};

export const bindControls = (): (() => void) => {
  const onDown = keyHandler(true);
  const onUp = keyHandler(false);

  window.addEventListener("keydown", onDown);
  window.addEventListener("keyup", onUp);

  return () => {
    window.removeEventListener("keydown", onDown);
    window.removeEventListener("keyup", onUp);
  };
};

export const pollControls = (): ControlState => {
  let mx = 0;
  let mz = 0;

  if (held.has("KeyW") || held.has("ArrowUp")) {
    mz -= 1;
  }

  if (held.has("KeyS") || held.has("ArrowDown")) {
    mz += 1;
  }

  if (held.has("KeyA") || held.has("ArrowLeft")) {
    mx -= 1;
  }

  if (held.has("KeyD") || held.has("ArrowRight")) {
    mx += 1;
  }

  const len = Math.sqrt(mx * mx + mz * mz);

  const interact = interactJustPressed;
  interactJustPressed = false;

  return {
    moveDir: len > 0 ? { x: mx / len, z: mz / len } : { x: 0, z: 0 },
    interact,
  };
};
