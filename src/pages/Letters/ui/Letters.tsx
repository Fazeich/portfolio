import { useFrame } from "@react-three/fiber";
import { memo, useCallback, useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { LETTER_COLOR, LETTER_EMISSIVE } from "../lib/constants";
import { getLetterGeometry } from "../lib/geometry";
import { LettersWorld, LetterEntity } from "../lib/types";
import { getLetterScale } from "../lib/world";

const letterMaterial = new THREE.MeshStandardMaterial({
  color: LETTER_COLOR,
  emissive: LETTER_EMISSIVE,
  emissiveIntensity: 0.9,
  metalness: 0.35,
  roughness: 0.45,
});

interface LetterMeshProps {
  entity: LetterEntity;
  attachMesh: (id: number, mesh: THREE.Mesh | null) => void;
}

const LetterMesh = memo(function LetterMesh({
  entity,
  attachMesh,
}: LetterMeshProps) {
  const ref = useRef<THREE.Mesh>(null);
  const geometry = useMemo(() => getLetterGeometry(entity.char), [entity.char]);

  useEffect(() => {
    if (ref.current) {
      attachMesh(entity.id, ref.current);
    }

    return () => attachMesh(entity.id, null);
  }, [entity.id, attachMesh]);

  return (
    <mesh ref={ref} geometry={geometry} material={letterMaterial} />
  );
});

export const Letters = ({ world }: { world: LettersWorld }) => {
  const meshes = useRef(new Map<number, THREE.Mesh>());

  const attachMesh = useCallback((id: number, mesh: THREE.Mesh | null) => {
    if (mesh) {
      meshes.current.set(id, mesh);
    } else {
      meshes.current.delete(id);
    }
  }, []);

  useFrame(() => {
    const { letters } = world;

    for (const letter of letters) {
      const mesh = meshes.current.get(letter.id);

      if (!mesh) {
        continue;
      }

      const scale = getLetterScale(world, letter);

      mesh.position.copy(letter.pos);
      mesh.scale.setScalar(scale);
      mesh.rotation.set(letter.tiltX, 0, letter.tiltZ);
    }
  });

  return (
    <group>
      {world.letters.map((letter) => (
        <LetterMesh key={letter.id} entity={letter} attachMesh={attachMesh} />
      ))}
    </group>
  );
};
