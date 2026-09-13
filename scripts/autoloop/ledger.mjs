import fs from "node:fs";
import path from "node:path";
import { paths } from "./config.mjs";

const ensureDir = () => {
  fs.mkdirSync(path.dirname(paths.ledger), { recursive: true });
};

export const appendEntry = (entry) => {
  ensureDir();
  const line = JSON.stringify({ at: new Date().toISOString(), ...entry });

  fs.appendFileSync(paths.ledger, `${line}\n`, "utf8");
};

export const readEntries = () => {
  if (!fs.existsSync(paths.ledger)) {
    return [];
  }

  return fs
    .readFileSync(paths.ledger, "utf8")
    .split("\n")
    .filter(Boolean)
    .map((line) => {
      try {
        return JSON.parse(line);
      } catch {
        return null;
      }
    })
    .filter(Boolean);
};

export const lastScores = (element) => {
  return readEntries()
    .filter((entry) => entry.element === element && typeof entry.score === "number")
    .map((entry) => entry.score);
};
