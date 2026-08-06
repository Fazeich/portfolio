import { existsSync, readFileSync, writeFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const dir = resolve(__dirname, "../src/pages/Portfolio/lib/assets/character");

const gltf = JSON.parse(readFileSync(resolve(dir, "scene.gltf"), "utf8"));

const binFile = gltf.buffers[0].uri;
gltf.buffers[0].uri = `data:application/octet-stream;base64,${readFileSync(
  resolve(dir, binFile),
).toString("base64")}`;

// 1x1 white PNG (fallback for missing textures)
const WHITE_PNG =
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==";

for (const image of gltf.images) {
  const file = resolve(dir, image.uri);

  if (!existsSync(file)) {
    console.warn(`MISSING texture, using white placeholder: ${image.uri}`);
    image.uri = `data:image/png;base64,${WHITE_PNG}`;

    continue;
  }

  const ext = image.uri.split(".").pop();
  const mime = ext === "jpg" || ext === "jpeg" ? "image/jpeg" : "image/png";
  const data = readFileSync(file);

  image.uri = `data:${mime};base64,${data.toString("base64")}`;
}

writeFileSync(resolve(dir, "character.gltf"), JSON.stringify(gltf));

console.log("character.gltf written (self-contained)");
