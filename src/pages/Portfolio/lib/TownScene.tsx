import { SoftShadows } from "@react-three/drei";
import { CharacterId, TownState } from "./state";
import {
  FOG_FAR,
  FOG_NEAR,
  PLAYER_RADIUS,
  SKY_COLOR,
  SUN_POSITION,
} from "./constants";
import { CharacterModel } from "./CharacterModel";
import { CarModel } from "./CarModel";
import { CAR_RADIUS } from "./carPhysics";
import { Crates } from "./Crates";
import { CameraRig } from "./CameraRig";
import { Terrain } from "./Terrain";
import { Props } from "./Props";
import { Pedestals } from "./Pedestals";
import { Ramps } from "./Ramps";
import { WorldStreamer } from "./WorldStreamer";

export const TownScene = ({
  state,
  character,
  onNavigate,
}: {
  state: TownState;
  character: CharacterId;
  onNavigate: (path: string) => void;
}) => (
  <>
    <color attach="background" args={[SKY_COLOR]} />
    <fog attach="fog" args={[SKY_COLOR, FOG_NEAR, FOG_FAR]} />

    <hemisphereLight args={["#fff4e0", "#b8ad9a", 0.7]} />
    <directionalLight
      position={[SUN_POSITION.x, SUN_POSITION.y, SUN_POSITION.z]}
      intensity={1.6}
      color="#fff1dd"
      castShadow
      shadow-mapSize={[2048, 2048]}
      shadow-camera-left={-50}
      shadow-camera-right={50}
      shadow-camera-top={40}
      shadow-camera-bottom={-40}
      shadow-camera-near={1}
      shadow-camera-far={130}
      shadow-bias={-0.0004}
    />
    <directionalLight position={[-20, 22, -24]} intensity={0.35} color="#bfd9f2" />

    <SoftShadows size={16} samples={10} focus={0.8} />

    <WorldStreamer state={state} />
    <Terrain />
    <Props />
    <Ramps />
    <Pedestals state={state} />
    <Crates
      state={state}
      radius={character === "car" ? CAR_RADIUS : PLAYER_RADIUS}
    />

    {character === "mage" ? (
      <CharacterModel state={state} onNavigate={onNavigate} />
    ) : (
      <CarModel state={state} onNavigate={onNavigate} />
    )}

    <CameraRig state={state} />
  </>
);
