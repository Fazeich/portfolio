import { useUnit } from "effector-react";
import { SNAKE_MAX_HP } from "@/lib/constants";
import { $snake3d } from "@/stores/snake3d/snake3d";
import {
  BestValue,
  BoostFill,
  BoostLabel,
  BoostTrack,
  BoostWrapper,
  Heart,
  HpPanel,
  ScoreLabel,
  ScorePanel,
  ScoreValue,
} from "@/components/Hud/lib/styles";

export const Hud = () => {
  const { phase, score, hp, boost, best } = useUnit($snake3d);

  if (phase !== "playing" && phase !== "paused") {
    return null;
  }

  const boosting = boost > 0;

  return (
    <div>
      <ScorePanel>
        <ScoreLabel>Счёт</ScoreLabel>
        <ScoreValue>{score}</ScoreValue>
        <BestValue>Рекорд: {best}</BestValue>
      </ScorePanel>

      <HpPanel>
        {Array.from({ length: SNAKE_MAX_HP }).map((_, i) => (
          <Heart key={i} filled={i < hp}>
            ♥
          </Heart>
        ))}
      </HpPanel>

      <BoostWrapper>
        <BoostLabel>
          <span>Буст</span>
          <span>{Math.round(boost)}%</span>
        </BoostLabel>
        <BoostTrack>
          <BoostFill ratio={boost / 100} boosting={boosting} />
        </BoostTrack>
      </BoostWrapper>
    </div>
  );
};
