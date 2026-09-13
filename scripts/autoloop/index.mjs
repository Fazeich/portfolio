import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import {
  ROOT,
  agentName,
  branchPrefix,
  model,
  paths,
  scoreThreshold,
  elements,
} from "./config.mjs";
import { appendEntry, readEntries } from "./ledger.mjs";
import { allPassed, formatResults, runGates } from "./verifier.mjs";
import { ensureTasks, markDone, nextTask } from "./planner.mjs";
import { generate } from "./generator.mjs";
import { captureAll } from "./visual.mjs";
import { judge } from "./judge.mjs";
import { implementPrompt, rubric } from "./prompts.mjs";

const starterTasks = [
  {
    id: "MAP-001",
    element: "terrain-surface",
    text: "Improve terrain readability while preserving the existing town gameplay and performance budget",
  },
  {
    id: "MAP-002",
    element: "props",
    text: "Add procedural voxel props that reinforce the town's visual landmarks without external assets",
  },
  {
    id: "MAP-003",
    element: "distant-horizon",
    text: "Improve distant background silhouettes without exceeding the scene performance budget",
  },
];

const git = (args, cwd = ROOT) =>
  spawnSync("git", args, { cwd, encoding: "utf8", shell: false });

const parseArgs = () => {
  const argv = process.argv.slice(2);
  const get = (flag, fallback) => {
    const index = argv.indexOf(flag);

    return index >= 0 ? argv[index + 1] : fallback;
  };

  return {
    maxIter: Number(get("--max-iter", "3")),
    element: get("--element", null),
    captureOnly: argv.includes("--capture-only"),
    skipGenerate: argv.includes("--skip-generate"),
  };
};

const ensureDirs = () => {
  for (const dir of [paths.autoloop, paths.logs, paths.frames, paths.baseline]) {
    fs.mkdirSync(dir, { recursive: true });
  }

  ensureTasks(starterTasks);
};

const cleanWorktree = () => {
  git(["reset", "--hard", "HEAD"], paths.worktree);
  git(["clean", "-fd"], paths.worktree);
};

const ensureWorktree = () => {
  if (fs.existsSync(path.join(paths.worktree, ".git"))) {
    return;
  }

  fs.rmSync(paths.worktree, { recursive: true, force: true });
  const branch = `${branchPrefix}/${Date.now()}`;
  const result = git(["worktree", "add", paths.worktree, "-b", branch, "HEAD"]);

  if (result.status !== 0) {
    throw new Error(`git worktree add failed: ${result.stderr}`);
  }

  const modules = path.join(ROOT, "node_modules");
  const link = path.join(paths.worktree, "node_modules");

  if (!fs.existsSync(link)) {
    fs.symlinkSync(modules, link, "junction");
  }
};

const bestScores = () => {
  const map = {};

  for (const entry of readEntries()) {
    if (entry.element && typeof entry.score === "number") {
      map[entry.element] = Math.max(map[entry.element] ?? 0, entry.score);
    }
  }

  return map;
};

const targetReached = () => {
  const scores = bestScores();

  return elements.every((element) => (scores[element] ?? 0) >= scoreThreshold);
};

const runIteration = async ({ element, skipGenerate }) => {
  const task = nextTask(element);

  if (!task) {
    return { status: "no-tasks" };
  }

  const reviewElement = element ?? task.element;

  const startedAt = Date.now();
  const beforeDir = path.join(paths.baseline, task.id);

  try {
    await captureAll({ dir: paths.worktree, outDir: beforeDir, seed: 1 });
  } catch (error) {
    appendEntry({
      type: "iteration",
      task: task.id,
      element: reviewElement,
      accepted: false,
      reason: `baseline capture failed: ${error.message}`,
    });

    cleanWorktree();
    return { status: "baseline-failed", task, error };
  }

  if (!skipGenerate) {
    const prompt = implementPrompt({ task, element: reviewElement });
    const gen = generate({ dir: paths.worktree, prompt });

    fs.writeFileSync(
      path.join(paths.logs, `${task.id}-generate.json`),
      gen.output,
      "utf8",
    );

    if (!gen.ok) {
      cleanWorktree();
      return { status: "generate-failed", task, gen };
    }
  }

  const gates = runGates(paths.worktree);

  if (!allPassed(gates)) {
    cleanWorktree();
    appendEntry({
      type: "iteration",
      task: task.id,
      element: reviewElement,
      accepted: false,
      reason: `gates: ${formatResults(gates)}`,
      ms: Date.now() - startedAt,
    });

    return { status: "gates-failed", task, gates };
  }

  const framesDir = path.join(paths.frames, task.id);
  let captures = [];

  try {
    captures = await captureAll({
      dir: paths.worktree,
      outDir: framesDir,
      seed: 1,
    });
  } catch (error) {
    appendEntry({
      type: "iteration",
      task: task.id,
      element: reviewElement,
      accepted: false,
      reason: `capture failed: ${error.message}`,
    });

    cleanWorktree();

    return { status: "capture-failed", task, error };
  }

  const overview = captures.find((item) => item.id === "town-overview");
  let verdict = null;

  if (overview && reviewElement) {
    verdict = judge({
      before: path.join(beforeDir, "town-overview.png"),
      after: overview.file,
      element: reviewElement,
      rubric,
    });

    if (!verdict.ok || typeof verdict.score !== "number" || verdict.score < scoreThreshold) {
      appendEntry({
        type: "iteration",
        task: task.id,
        element: reviewElement,
        accepted: false,
        score: verdict.score,
        reason: verdict.ok ? `visual score below ${scoreThreshold}` : "visual judge failed",
        ms: Date.now() - startedAt,
      });

      cleanWorktree();
      return { status: "visual-rejected", task, verdict };
    }
  }

  git(["add", "-A"], paths.worktree);
  const commit = git(
    ["commit", "-m", `autoloop: ${task.id} ${task.text}`],
    paths.worktree,
  );

  if (commit.status !== 0) {
    cleanWorktree();
    return { status: "commit-failed", task, commit };
  }

  markDone(task.id);
  appendEntry({
    type: "iteration",
    task: task.id,
      element: reviewElement,
    accepted: true,
    score: verdict?.score ?? null,
    gates: formatResults(gates),
    ms: Date.now() - startedAt,
  });

  return { status: "accepted", task, verdict };
};

const main = async () => {
  const args = parseArgs();

  ensureDirs();

  if (args.captureOnly) {
    const outDir = path.join(paths.frames, `manual-${Date.now()}`);
    const captures = await captureAll({ dir: ROOT, outDir, seed: 1 });

    console.log(JSON.stringify(captures, null, 2));

    return;
  }

  ensureWorktree();

  for (let i = 0; i < args.maxIter; i += 1) {
    if (targetReached()) {
      console.log("Target reached for all elements.");
      break;
    }

    const outcome = await runIteration({
      element: args.element,
      skipGenerate: args.skipGenerate,
    });

    console.log(`[${i + 1}] ${outcome.status}`, outcome.task?.id ?? "");

    if (outcome.status === "no-tasks") {
      break;
    }
  }
};

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
