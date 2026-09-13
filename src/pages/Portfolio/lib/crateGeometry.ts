import { box, mergeVoxelParts, VoxelPart } from "@/lib/voxel";

/** One shared mesh: inset planks, framing, diagonal braces and iron nails. */
export const createCrateGeometry = () => {
  const parts: VoxelPart[] = [
    { geometry: box(0.74, 0.74, 0.74), color: "#af793f" },
  ];
  for (const side of [-1, 1]) {
    for (const edge of [-1, 1]) {
      parts.push({ geometry: box(0.1, 0.84, 0.1), color: "#dbad69", position: [edge * 0.37, 0, side * 0.37] });
      parts.push({ geometry: box(0.64, 0.1, 0.1), color: "#d5a25d", position: [0, edge * 0.37, side * 0.37] });
      parts.push({ geometry: box(0.1, 0.1, 0.64), color: "#c99958", position: [side * 0.37, edge * 0.37, 0] });
      parts.push({ geometry: box(0.035, 0.035, 0.015), color: "#4c5350", position: [edge * 0.37, 0.32, side * 0.425] });
    }
    parts.push({ geometry: box(0.09, 0.9, 0.045), color: "#e1b775", position: [0, 0, side * 0.4], rotation: [0, 0, -Math.PI / 4] });
    // Recessed grooves make the grain visible without textures or extra materials.
    for (const offset of [-0.19, 0, 0.19]) {
      parts.push({ geometry: box(0.012, 0.64, 0.006), color: "#79552f", position: [offset, 0, side * 0.373] });
    }
  }
  return mergeVoxelParts(parts);
};
