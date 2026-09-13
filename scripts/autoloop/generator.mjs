import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { agentName, model } from "./config.mjs";

export const resolveOpencodeBin = () => {
  if (process.env.AUTOLOOP_OPENCODE_BIN) {
    return process.env.AUTOLOOP_OPENCODE_BIN;
  }

  const exe = process.platform === "win32" ? "opencode.exe" : "opencode";
  const candidates = [
    path.join(path.dirname(process.execPath), "node_modules", "opencode-ai", "bin", exe),
    path.join(process.env.APPDATA ?? "", "npm", "node_modules", "opencode-ai", "bin", exe),
  ];

  return candidates.find((candidate) => fs.existsSync(candidate)) ?? "opencode";
};

const runOpencode = (args, { cwd, timeoutMs }) => {
  const result = spawnSync(resolveOpencodeBin(), args, {
    cwd,
    encoding: "utf8",
    shell: false,
    env: process.env,
    timeout: timeoutMs,
    maxBuffer: 64 * 1024 * 1024,
  });

  return {
    ok: result.status === 0,
    code: result.status,
    output: `${result.stdout ?? ""}${result.stderr ?? ""}`,
  };
};

export const generate = ({ dir, prompt, timeoutMs = 20 * 60 * 1000 }) => {
  const args = [
    "run",
    prompt,
    "--model",
    model,
    "--format",
    "json",
    "--agent",
    agentName,
    "--auto",
  ];

  return runOpencode(args, { cwd: dir, timeoutMs });
};

export const parseLastText = (output) => {
  const texts = [];

  for (const line of output.split("\n")) {
    const trimmed = line.trim();

    if (!trimmed.startsWith("{")) {
      continue;
    }

    try {
      const event = JSON.parse(trimmed);
      const part = event?.part ?? event?.properties?.part;

      if (part?.type === "text" && typeof part.text === "string") {
        texts.push(part.text);
      }
    } catch {
      // ignore non-JSON lines
    }
  }

  return texts.join("\n").trim();
};

export { runOpencode };
