import { ANIMATION_DURATION, INTERACTION_RADIUS } from "./constants";
import { TownState } from "./state";
import { world } from "./world";

export const tryStartInteraction = (state: TownState): boolean => {
  const pedestals = world.pedestals;
  let nearest = -1;
  let nearestDist = INTERACTION_RADIUS;

  for (let i = 0; i < pedestals.length; i += 1) {
    const pedestal = pedestals[i];
    const dx = state.player.x - pedestal.position.x;
    const dz = state.player.z - pedestal.position.z;
    const distance = Math.sqrt(dx * dx + dz * dz);

    if (distance < nearestDist) {
      nearestDist = distance;
      nearest = i;
    }
  }

  if (nearest < 0) {
    return false;
  }

  state.interacting = true;
  state.interactionTimer = 0;
  state.interactionTarget = pedestals[nearest].target;

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
