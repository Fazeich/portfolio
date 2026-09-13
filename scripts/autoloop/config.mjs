import path from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));

export const ROOT = path.resolve(scriptDir, "..", "..");

export const paths = {
  autoloop: path.join(ROOT, ".autoloop"),
  tasks: path.join(ROOT, ".autoloop", "tasks.md"),
  ledger: path.join(ROOT, ".autoloop", "ledger.jsonl"),
  logs: path.join(ROOT, ".autoloop", "logs"),
  frames: path.join(ROOT, ".autoloop", "frames"),
  baseline: path.join(ROOT, ".autoloop", "baseline"),
  worktree: path.join(ROOT, ".autoloop", "wt"),
};

export const model = process.env.AUTOLOOP_MODEL ?? "opencode-go/deepseek-v4.1-flash";

export const agentName = "autoloop";

export const branchPrefix = "autoloop";

export const budgets = {
  fpsTarget: 60,
  fpsMin: 45,
  drawCalls: 300,
  triangles: 150_000,
  activeChunks: 40,
  physicsBodies: 200,
};

export const scoreThreshold = 8;

export const elements = [
  "terrain-surface",
  "terrain-detail",
  "rocks-cliffs",
  "trees-vegetation",
  "biome-transitions",
  "distant-horizon",
  "pedestals",
  "props",
];

export const gates = [
  { name: "lint", args: ["run", "lint"] },
  { name: "typecheck", args: ["run", "typecheck"] },
  { name: "test", args: ["run", "test"] },
  { name: "build", args: ["run", "build"] },
];

export const preview = {
  port: 4173,
  urlPath: "/portfolio/",
};

export const captures = [
  { id: "town-overview", route: "", settleMs: 2500, freeze: true },
  {
    id: "town-walk",
    route: "",
    settleMs: 1500,
    freeze: true,
    player: { x: 10, z: -9, facing: Math.PI },
  },
  { id: "snake", route: "snake", settleMs: 2500, freeze: false },
  { id: "letters", route: "letters", settleMs: 1800, freeze: false },
];
