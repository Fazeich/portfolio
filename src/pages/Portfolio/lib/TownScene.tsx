import { TownState } from "./state";
import { Ground } from "./Ground";
import { Walls } from "./Walls";
import { Stones } from "./Stones";
import { Gravel } from "./Gravel";
import { FloorLines } from "./FloorLines";
import { ALTARS } from "./constants";
import { AltarSign } from "./AltarSign";
import { CharacterModel } from "./CharacterModel";
import { CameraRig } from "./CameraRig";

export const TownScene = ({
  state,
  onNavigate,
}: {
  state: TownState;
  onNavigate: (path: string) => void;
}) => (
  <>
    <ambientLight intensity={0.55} />
    <directionalLight
      position={[15, 30, 12]}
      intensity={1.4}
      castShadow
      shadow-mapSize={[2048, 2048]}
      shadow-camera-left={-38}
      shadow-camera-right={38}
      shadow-camera-top={28}
      shadow-camera-bottom={-28}
      shadow-camera-near={1}
      shadow-camera-far={80}
    />
    <directionalLight position={[-10, 12, -15]} intensity={0.3} />

    <Ground />
    <Walls />
    <Stones />
    <Gravel />
    <FloorLines />
    {ALTARS.map((altar) => (
      <AltarSign key={altar.id} altar={altar} />
    ))}
    <CharacterModel state={state} onNavigate={onNavigate} />
    <CameraRig state={state} />
  </>
);
