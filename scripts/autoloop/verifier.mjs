import { spawnSync } from "node:child_process";
import { ROOT, gates } from "./config.mjs";

const npmBin = process.platform === "win32" ? "npm.cmd" : "npm";

export const runGate = (gate, cwd = ROOT) => {
  const result = spawnSync(npmBin, gate.args, {
    cwd,
    encoding: "utf8",
    shell: false,
    env: process.env,
    maxBuffer: 32 * 1024 * 1024,
  });

  const output = `${result.stdout ?? ""}${result.stderr ?? ""}`;

  return {
    name: gate.name,
    ok: result.status === 0,
    code: result.status,
    output: output.slice(-8000),
  };
};

export const runGates = (cwd = ROOT) => gates.map((gate) => runGate(gate, cwd));

export const allPassed = (results) => results.every((result) => result.ok);

export const formatResults = (results) =>
  results
    .map((result) => `${result.ok ? "PASS" : "FAIL"} ${result.name}`)
    .join(", ");
