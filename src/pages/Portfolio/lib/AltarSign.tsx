import { Billboard, Center, Text3D } from "@react-three/drei";
import { AltarDef } from "./constants";
import fontUrl from "@/lib/assets/fonts/helvetiker_bold.typeface.json?url";

const altarMaterial = {
  color: "#6b655c",
  roughness: 0.9,
};

const textMaterial = {
  color: "#263449",
  metalness: 0.55,
  roughness: 0.3,
};

export const AltarSign = ({ altar }: { altar: AltarDef }) => (
  <group position={[altar.position.x, 0, altar.position.z]}>
    <mesh position={[0, 0.2, 0]} castShadow receiveShadow>
      <boxGeometry args={[2.2, 0.4, 1.6]} />
      <meshStandardMaterial {...altarMaterial} />
    </mesh>

    <mesh position={[0, 0.9, 0]} castShadow receiveShadow>
      <boxGeometry args={[1.8, 1, 1.2]} />
      <meshStandardMaterial {...altarMaterial} />
    </mesh>

    <mesh position={[0, 1.55, 0]} castShadow receiveShadow>
      <boxGeometry args={[2.4, 0.3, 1.8]} />
      <meshStandardMaterial {...altarMaterial} />
    </mesh>

    <Billboard position={[0, 3, 0]}>
      <Center>
        <Text3D
          font={fontUrl}
          size={1.2}
          height={0.28}
          bevelEnabled
          bevelThickness={0.02}
          bevelSize={0.02}
          bevelSegments={2}
          curveSegments={6}
          letterSpacing={0.02}
        >
          {altar.text}
          <meshStandardMaterial {...textMaterial} />
        </Text3D>
      </Center>
    </Billboard>
  </group>
);
