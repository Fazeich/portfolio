import { SoftShadows } from "@react-three/drei";
import { CharacterId, TownState } from "./state";
import { Ground } from "./Ground";
import { Walls } from "./Walls";
import { Stones } from "./Stones";
import { Gravel } from "./Gravel";
import {
  ALTARS,
  FOG_FAR,
  FOG_NEAR,
  PLAYER_RADIUS,
  SKY_COLOR,
  SUN_POSITION,
} from "./constants";
import { AltarSign } from "./AltarSign";
import { CharacterModel } from "./CharacterModel";
import { CarModel, CAR_RADIUS } from "./CarModel";
import { Crates } from "./Crates";
import { CameraRig } from "./CameraRig";
import { Hills } from "./Hills";
import { Trees } from "./Trees";
import { Lanterns } from "./Lanterns";

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

    <hemisphereLight args={["#fff4e0", "#b8ad9a", 0.6]} />
    <directionalLight
      position={[SUN_POSITION.x, SUN_POSITION.y, SUN_POSITION.z]}
      intensity={1.5}
      color="#fff1dd"
      castShadow
      shadow-mapSize={[2048, 2048]}
      shadow-camera-left={-38}
      shadow-camera-right={38}
      shadow-camera-top={28}
      shadow-camera-bottom={-28}
      shadow-camera-near={1}
      shadow-camera-far={80}
      shadow-bias={-0.0004}
    />
    <directionalLight position={[-12, 14, -16]} intensity={0.35} color="#bfd9f2" />

    <SoftShadows size={14} samples={10} focus={0.8} />

    <Ground />
    <Walls />
    <Hills />
    <Stones />
    <Trees />
    <Gravel />
    <Lanterns />
    <Crates state={state} radius={character === "car" ? CAR_RADIUS : PLAYER_RADIUS} />

    {ALTARS.map((altar) => (
      <AltarSign
        key={altar.id}
        altar={altar}
        active={state.hoveredAltarId === altar.id}
      />
    ))}

    {character === "mage" ? (
      <CharacterModel state={state} onNavigate={onNavigate} />
    ) : (
      <CarModel state={state} onNavigate={onNavigate} />
    )}

    <CameraRig state={state} />
  </>
);
