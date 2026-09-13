import { useEffect, useMemo, useSyncExternalStore } from "react";
import * as THREE from "three";
import { hash2 } from "@/lib/random";
import {
  CHUNK_SIZE,
  FOG_FAR,
} from "./constants";
import { getWorldRevision, subscribeWorld, terrain, world } from "./world";
import { getChunkGeometry } from "./world/geometry";

const distantMaterial = new THREE.MeshStandardMaterial({
  color: "#9fc3d4",
  roughness: 1,
  metalness: 0,
});

const DETAIL_TEXTURE_SIZE = 1024;

const createGroundDetailTexture = (seed: number): THREE.Texture => {
  const canvas = document.createElement("canvas");

  canvas.width = DETAIL_TEXTURE_SIZE;
  canvas.height = DETAIL_TEXTURE_SIZE;

  const context = canvas.getContext("2d");

  if (!context) {
    return new THREE.Texture();
  }

  const image = context.createImageData(DETAIL_TEXTURE_SIZE, DETAIL_TEXTURE_SIZE);
  const data = image.data;

  for (let y = 0; y < DETAIL_TEXTURE_SIZE; y += 1) {
    for (let x = 0; x < DETAIL_TEXTURE_SIZE; x += 1) {
      const index = (y * DETAIL_TEXTURE_SIZE + x) * 4;
      const noise = hash2(x, y, seed + 101);
      const grain = Math.floor(224 + noise * 32);
      const warm = hash2(x * 0.25, y * 0.25, seed + 211) > 0.82 ? 5 : 0;

      data[index] = Math.min(255, grain + warm);
      data[index + 1] = Math.min(255, grain + warm + 1);
      data[index + 2] = Math.min(255, grain + warm - 2);
      data[index + 3] = 255;
    }
  }

  context.putImageData(image, 0, 0);

  const texture = new THREE.CanvasTexture(canvas);

  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.magFilter = THREE.NearestFilter;
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.needsUpdate = true;

  return texture;
};

interface ChunkMesh {
  key: string;
  position: [number, number, number];
  geometry: THREE.BufferGeometry;
}

export const Terrain = () => {
  const revision = useSyncExternalStore(
    subscribeWorld,
    getWorldRevision,
    getWorldRevision,
  );
  const detailTexture = useMemo(
    () => createGroundDetailTexture(world.seed),
    [],
  );
  const groundMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        map: detailTexture,
        vertexColors: true,
        flatShading: true,
        roughness: 0.95,
        metalness: 0,
      }),
    [detailTexture],
  );
  useEffect(() => () => {
    groundMaterial.dispose();
    detailTexture.dispose();
  }, [groundMaterial, detailTexture]);

  const meshes = useMemo<ChunkMesh[]>(() => {
    void revision;
    const list: ChunkMesh[] = [];

    for (const chunk of world.chunks) {
      const { cx, cz } = chunk;

        list.push({
          key: `${cx}-${cz}`,
          position: [
            cx * CHUNK_SIZE + CHUNK_SIZE / 2,
            0,
            cz * CHUNK_SIZE + CHUNK_SIZE / 2,
          ],
          geometry: getChunkGeometry(chunk, terrain),
        });
    }

    return list;
  }, [revision]);

  return (
    <group>
      {meshes.map((chunk) => (
        <mesh
          key={chunk.key}
          dispose={null}
          geometry={chunk.geometry}
          material={groundMaterial}
          position={chunk.position}
          receiveShadow
        />
      ))}

      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -2.5, 0]}
        material={distantMaterial}
      >
        <planeGeometry args={[FOG_FAR * 8, FOG_FAR * 8]} />
      </mesh>
    </group>
  );
};
