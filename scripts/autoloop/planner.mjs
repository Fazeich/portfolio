import fs from "node:fs";
import { paths } from "./config.mjs";

const TASK_RE = /^- \[( |x)\] ([A-Za-z0-9-]+)(?: @([A-Za-z0-9-]+))? :: (.+)$/;

export const readTasks = () => {
  if (!fs.existsSync(paths.tasks)) {
    return [];
  }

  return fs
    .readFileSync(paths.tasks, "utf8")
    .split("\n")
    .map((line) => {
      const match = TASK_RE.exec(line.trim());

      if (!match) {
        return null;
      }

      return {
        done: match[1] === "x",
        id: match[2],
        element: match[3] ?? null,
        text: match[4],
        line: line.trim(),
      };
    })
    .filter(Boolean);
};

export const nextTask = (element = null) =>
  readTasks().find(
    (task) => !task.done && (!element || !task.element || task.element === element),
  ) ?? null;

export const markDone = (id) => {
  const lines = fs.readFileSync(paths.tasks, "utf8").split("\n");
  const updated = lines.map((line) => {
    const match = TASK_RE.exec(line.trim());

    if (match && match[2] === id && match[1] === " ") {
      return line.replace("- [ ]", "- [x]");
    }

    return line;
  });

  fs.writeFileSync(paths.tasks, updated.join("\n"), "utf8");
};

export const addTasks = (tasks) => {
  const existing = fs.existsSync(paths.tasks)
    ? fs.readFileSync(paths.tasks, "utf8").trimEnd()
    : "# Autoloop Tasks\n";

  const block = tasks
    .map(
      (task) =>
        `- [ ] ${task.id}${task.element ? ` @${task.element}` : ""} :: ${task.text}`,
    )
    .join("\n");

  fs.writeFileSync(paths.tasks, `${existing}\n${block}\n`, "utf8");
};

export const pendingCount = () => readTasks().filter((task) => !task.done).length;

export const ensureTasks = (tasks) => {
  if (fs.existsSync(paths.tasks) && pendingCount() > 0) {
    return false;
  }

  addTasks(tasks);
  return true;
};
