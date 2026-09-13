import path from "node:path";
import { spawn, spawnSync } from "node:child_process";
import fs from "node:fs";
import { chromium } from "@playwright/test";
import { ROOT, captures, preview } from "./config.mjs";

const viteBin = path.join(
  ROOT,
  "node_modules",
  ".bin",
  process.platform === "win32" ? "vite.cmd" : "vite",
);

const waitForServer = async (url, timeoutMs = 60_000) => {
  const started = Date.now();

  while (Date.now() - started < timeoutMs) {
    try {
      const res = await fetch(url);

      if (res.ok) {
        return true;
      }
    } catch {
      // not ready yet
    }

    await new Promise((resolve) => setTimeout(resolve, 500));
  }

  return false;
};

export const startPreview = (dir) => {
  const child = spawn(
    viteBin,
    [
      "preview",
      "--config",
      "configs/vite.config.ts",
      "--port",
      String(preview.port),
      "--strictPort",
    ],
    { cwd: dir, stdio: "ignore", shell: true },
  );

  return child;
};

const stopPreview = (child) => {
  if (!child?.pid) {
    return;
  }

  if (process.platform === "win32") {
    spawnSync("taskkill", ["/pid", String(child.pid), "/T", "/F"], {
      stdio: "ignore",
    });

    return;
  }

  try {
    child.kill("SIGTERM");
  } catch {
    // already gone
  }
};

export const captureAll = async ({ dir, outDir, seed = 0 }) => {
  fs.mkdirSync(outDir, { recursive: true });

  const server = startPreview(dir);
  const baseUrl = `http://localhost:${preview.port}${preview.urlPath}`;
  const ready = await waitForServer(baseUrl);

  if (!ready) {
    stopPreview(server);
    throw new Error(`preview server did not start at ${baseUrl}`);
  }

  const browser = await chromium.launch({ channel: "chrome", headless: true });
  const results = [];

  try {
    for (const capture of captures) {
      const page = await browser.newPage({
        viewport: { width: 1280, height: 720 },
        deviceScaleFactor: 1,
      });

      const url = `${baseUrl}${capture.route}?autoloop=1&seed=${seed}`;

       await page.goto(url, { waitUntil: "load", timeout: 30_000 });
       await page.waitForTimeout(capture.settleMs);

       if (capture.freeze || capture.player) {
         await page.waitForFunction(
           () => Boolean(window.__autoloop),
           undefined,
           { timeout: 10_000 },
         );
       }

      if (capture.player) {
        await page.evaluate((player) => {
          window.__autoloop?.setPlayer(player);
        }, capture.player);
        await page.waitForTimeout(600);
      }

      if (capture.freeze) {
        await page.evaluate(() => {
          window.__autoloop?.hideHud(true);
          window.__autoloop?.freeze(true);
        });
        await page.waitForTimeout(300);
      }

      const file = path.join(outDir, `${capture.id}.png`);

      await page.screenshot({ path: file });
      results.push({ id: capture.id, file, url });
      await page.close();
    }
  } finally {
    await browser.close();
    stopPreview(server);
  }

  return results;
};
