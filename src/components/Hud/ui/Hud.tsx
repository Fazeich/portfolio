import { useEffect, useRef } from "react";
import { useUnit } from "effector-react";
import { useTheme } from "styled-components";
import { SNAKE_MAX_HP } from "@/lib/constants";
import { WorldState } from "@/lib/types";
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

export const Hud = ({ world }: { world: WorldState }) => {
  const theme = useTheme();
  const { phase, score, hp, best } = useUnit($snake3d);
  const fillRef = useRef<HTMLDivElement>(null);
  const percentRef = useRef<HTMLSpanElement>(null);
  const active = phase === "playing" || phase === "paused";

  useEffect(() => {
    if (!active) {
      return;
    }

    let raf = 0;

    const tick = () => {
      const { boost, boosting } = world.snake;
      const percent = Math.round(boost);
      const color = boosting ? theme.ui.boost : theme.ui.accent;

      if (fillRef.current) {
        fillRef.current.style.width = `${percent}%`;
        fillRef.current.style.background = color;
        fillRef.current.style.boxShadow = `0 0 12px ${color}`;
      }

      if (percentRef.current) {
        percentRef.current.textContent = `${percent}%`;
      }

      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);

    return () => cancelAnimationFrame(raf);
  }, [active, world, theme.ui.boost, theme.ui.accent]);

  if (!active) {
    return null;
  }

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
          <span ref={percentRef}>100%</span>
        </BoostLabel>
        <BoostTrack>
          <BoostFill ref={fillRef} />
        </BoostTrack>
      </BoostWrapper>
    </div>
  );
};
