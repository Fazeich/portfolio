import { useFrame } from "@react-three/fiber";
import { TownState } from "./state";
import { updateWorldStreaming } from "./world";

export const WorldStreamer = ({ state }: { state: TownState }) => {
  useFrame(() => {
    updateWorldStreaming(state.player.x, state.player.z);
  });

  return null;
};
