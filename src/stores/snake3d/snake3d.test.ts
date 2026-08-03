import { beforeEach, describe, expect, it } from "vitest";
import { $snake3d } from "@/stores/snake3d/snake3d";
import {
  addScore,
  gameOver,
  startGame,
} from "@/stores/snake3d/events";

interface StorageLike {
  getItem: (key: string) => string | null;
  setItem: (key: string, value: string) => void;
}

const createStorage = (): StorageLike => {
  let value: string | null = null;

  return {
    getItem: (key: string) => (key === "snake3d-best" ? value : null),
    setItem: (key: string, next: string) => {
      if (key === "snake3d-best") {
        value = next;
      }
    },
  };
};

describe("$snake3d store", () => {
  beforeEach(() => {
    globalThis.localStorage = createStorage() as unknown as Storage;
    $snake3d.reset();
  });

  it("starts a new game and increments gameId", () => {
    const before = $snake3d.getState();

    startGame();

    const after = $snake3d.getState();

    expect(after.phase).toBe("playing");
    expect(after.gameId).toBe(before.gameId + 1);
  });

  it("accumulates score and updates the best", () => {
    addScore(5);
    addScore(3);

    const state = $snake3d.getState();

    expect(state.score).toBe(8);
    expect(state.best).toBe(8);
  });

  it("persists the best score on game over", () => {
    startGame();
    addScore(10);
    gameOver();

    const state = $snake3d.getState();

    expect(state.phase).toBe("gameover");
    expect((globalThis.localStorage as StorageLike).getItem("snake3d-best")).toBe(
      "10",
    );
  });
});
