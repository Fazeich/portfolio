import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { HALF_D, HALF_W, PLAYER_MARGIN } from "./constants";
import { TownState } from "./state";

const BLOCK_HALF = 0.42;
const GRID_CENTER = { x: 0, z: -6 };
const IMPULSE_BASE = 5;
const IMPULSE_SPEED = 0.85;
const POP_UP = 3;
const GRAVITY = 14;
const DRAG = 2.2;
const WALL_BOUNCE = 0.55;
const REST_EPSILON = 0.04;
const SUPPORT_EPS = 0.06;
const CHARACTER_REACH = 0.7;

const blockMaterial = new THREE.MeshStandardMaterial({
  color: "#bf8f52",
  roughness: 0.8,
});

const blockDarkMaterial = new THREE.MeshStandardMaterial({
  color: "#a5763c",
  roughness: 0.8,
});

interface BlockState {
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  vz: number;
  angle: number;
  spin: number;
  resting: boolean;
}

const makeBlock = (x: number, z: number, y: number): BlockState => ({
  x: GRID_CENTER.x + x,
  y,
  z: GRID_CENTER.z + z,
  vx: 0,
  vy: 0,
  vz: 0,
  angle: 0,
  spin: 0,
  resting: true,
});

const createBlocks = (): BlockState[] => {
  const layer = [
    [0, 0],
    [1.02, 0],
    [0, 1.02],
    [1.02, 1.02],
  ] as const;
  const blocks: BlockState[] = [];

  for (const [x, z] of layer) {
    blocks.push(makeBlock(x, z, BLOCK_HALF));
  }

  for (const [x, z] of layer) {
    blocks.push(makeBlock(x, z, BLOCK_HALF * 3));
  }

  blocks.push(makeBlock(0.51, 0.51, BLOCK_HALF * 5));

  return blocks;
};

const overlapsXZ = (a: BlockState, b: BlockState): boolean => {
  return (
    Math.abs(a.x - b.x) < BLOCK_HALF * 2 &&
    Math.abs(a.z - b.z) < BLOCK_HALF * 2
  );
};

const isSupported = (block: BlockState, blocks: BlockState[]): boolean => {
  if (block.y - BLOCK_HALF <= SUPPORT_EPS) {
    return true;
  }

  const bottom = block.y - BLOCK_HALF;

  for (const other of blocks) {
    if (other === block) {
      continue;
    }

    const top = other.y + BLOCK_HALF;

    if (Math.abs(bottom - top) <= SUPPORT_EPS && overlapsXZ(block, other)) {
      return true;
    }
  }

  return false;
};

export const Crates = ({
  state,
  radius,
}: {
  state: TownState;
  radius: number;
}) => {
  const blocks = useMemo(() => createBlocks(), []);
  const refs = useRef<Array<THREE.Mesh | null>>([]);
  const prevPos = useRef({ x: state.player.x, z: state.player.z });

  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.05);
    const p = state.player;

    const cvx = (p.x - prevPos.current.x) / Math.max(dt, 1e-4);
    const cvz = (p.z - prevPos.current.z) / Math.max(dt, 1e-4);
    const charSpeed = Math.hypot(cvx, cvz);

    prevPos.current.x = p.x;
    prevPos.current.z = p.z;

    for (const block of blocks) {
      if (block.y - BLOCK_HALF > CHARACTER_REACH) {
        continue;
      }

      const dx = block.x - p.x;
      const dz = block.z - p.z;
      const minDist = radius + BLOCK_HALF;
      const distSq = dx * dx + dz * dz;

      if (distSq >= minDist * minDist) {
        continue;
      }

      let nx: number;
      let nz: number;

      if (distSq > 1e-6) {
        const dist = Math.sqrt(distSq);

        nx = dx / dist;
        nz = dz / dist;
        block.x += nx * (minDist - dist);
        block.z += nz * (minDist - dist);
      } else {
        nx = Math.sin(p.facing);
        nz = Math.cos(p.facing);
      }

      const impact = IMPULSE_BASE + charSpeed * IMPULSE_SPEED;

      block.vx = nx * impact * (0.6 + Math.random() * 0.8);
      block.vz = nz * impact * (0.6 + Math.random() * 0.8);
      block.vy = Math.max(block.vy, 0) + POP_UP;
      block.spin = (Math.random() - 0.5) * 6;
      block.resting = false;
    }

    for (const block of blocks) {
      if (block.resting) {
        continue;
      }

      block.vy -= GRAVITY * dt;
      block.x += block.vx * dt;
      block.y += block.vy * dt;
      block.z += block.vz * dt;
      block.angle += block.spin * dt;

      block.vx *= 1 - DRAG * dt;
      block.vz *= 1 - DRAG * dt;
      block.spin *= 1 - DRAG * dt;

      if (block.y - BLOCK_HALF <= 0) {
        block.y = BLOCK_HALF;

        if (block.vy < 0) {
          block.vy = 0;
        }
      }

      const minX = -HALF_W + PLAYER_MARGIN + BLOCK_HALF;
      const maxX = HALF_W - PLAYER_MARGIN - BLOCK_HALF;
      const minZ = -HALF_D + PLAYER_MARGIN + BLOCK_HALF;
      const maxZ = HALF_D - PLAYER_MARGIN - BLOCK_HALF;

      if (block.x < minX) {
        block.x = minX;
        block.vx = Math.abs(block.vx) * WALL_BOUNCE;
      } else if (block.x > maxX) {
        block.x = maxX;
        block.vx = -Math.abs(block.vx) * WALL_BOUNCE;
      }

      if (block.z < minZ) {
        block.z = minZ;
        block.vz = Math.abs(block.vz) * WALL_BOUNCE;
      } else if (block.z > maxZ) {
        block.z = maxZ;
        block.vz = -Math.abs(block.vz) * WALL_BOUNCE;
      }
    }

    for (let i = 0; i < blocks.length; i += 1) {
      for (let j = i + 1; j < blocks.length; j += 1) {
        const a = blocks[i];
        const b = blocks[j];
        const dx = b.x - a.x;
        const dy = b.y - a.y;
        const dz = b.z - a.z;
        const ox = BLOCK_HALF * 2 - Math.abs(dx);
        const oy = BLOCK_HALF * 2 - Math.abs(dy);
        const oz = BLOCK_HALF * 2 - Math.abs(dz);

        if (ox <= 0 || oy <= 0 || oz <= 0) {
          continue;
        }

        if (oy <= ox && oy <= oz) {
          if (dy >= 0) {
            b.y += oy;

            if (b.vy < 0) {
              b.vy = 0;
            }
          } else {
            a.y += oy;

            if (a.vy < 0) {
              a.vy = 0;
            }
          }

          continue;
        }

        if (ox <= oz) {
          const sign = dx >= 0 ? 1 : -1;

          a.x -= sign * ox * 0.5;
          b.x += sign * ox * 0.5;
        } else {
          const sign = dz >= 0 ? 1 : -1;

          a.z -= sign * oz * 0.5;
          b.z += sign * oz * 0.5;
        }
      }
    }

    for (const block of blocks) {
      const speed = Math.hypot(block.vx, block.vy, block.vz);

      block.resting = isSupported(block, blocks) && speed < REST_EPSILON;

      if (block.resting) {
        block.vx = 0;
        block.vy = 0;
        block.vz = 0;
        block.spin = 0;
      }
    }

    for (let i = 0; i < blocks.length; i += 1) {
      const mesh = refs.current[i];

      if (!mesh) {
        continue;
      }

      mesh.position.set(blocks[i].x, blocks[i].y, blocks[i].z);
      mesh.rotation.y = blocks[i].angle;
    }
  });

  return (
    <group>
      {blocks.map((block, i) => (
        <mesh
          key={i}
          ref={(el) => {
            refs.current[i] = el;
          }}
          material={i % 2 === 0 ? blockMaterial : blockDarkMaterial}
          position={[block.x, block.y, block.z]}
          castShadow
          receiveShadow
        >
          <boxGeometry args={[BLOCK_HALF * 2, BLOCK_HALF * 2, BLOCK_HALF * 2]} />
        </mesh>
      ))}
    </group>
  );
};
