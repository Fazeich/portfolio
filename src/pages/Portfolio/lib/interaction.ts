import { ALTARS, ANIMATION_DURATION, INTERACTION_RADIUS } from "./constants";
import { TownState } from "./state";

export const tryStartInteraction = (state: TownState): boolean => {
  let nearest = -1;
  let nearestDist = INTERACTION_RADIUS;

  for (let i = 0; i < ALTARS.length; i += 1) {
    const altar = ALTARS[i];
    const ax = state.player.x - altar.position.x;
    const az = state.player.z - altar.position.z;
    const dist = Math.sqrt(ax * ax + az * az);

    if (dist < nearestDist) {
      nearestDist = dist;
      nearest = i;
    }
  }

  if (nearest < 0) {
    return false;
  }

  state.interacting = true;
  state.interactionTimer = 0;
  state.interactionTarget = ALTARS[nearest].target;

  return true;
};

export const stepInteraction = (
  state: TownState,
  dt: number,
  onNavigate: (path: string) => void,
): boolean => {
  if (!state.interacting) {
    return false;
  }

  state.interactionTimer += dt;

  if (state.interactionTimer >= ANIMATION_DURATION) {
    onNavigate(state.interactionTarget);
  }

  return true;
};
