import { useEffect, useRef } from "react";
import { SocialIcon } from "react-social-icons";
import { useNavigate } from "react-router-dom";
import { useUnit } from "effector-react";
import { GamePhase } from "@/lib/types";
import {
  pauseGame,
  resumeGame,
  startGame,
  toMenu,
} from "@/stores/snake3d/events";
import { $snake3d } from "@/stores/snake3d/snake3d";
import {
  Button,
  ButtonRow,
  Overlay,
  Panel,
  RulesItem,
  RulesList,
  ScoreText,
  SecondaryButton,
  SocialRow,
  Subtitle,
  Title,
} from "@/components/Screens/lib/styles";

const SOCIALS = [
  { url: "https://t.me/samsyaaa", network: "telegram" },
  { url: "https://github.com/fazeich", network: "github" },
  { url: "mailto:vladislavchenko@inbox.ru", network: "mailto" },
];

const useFocusTrap = (
  containerRef: React.RefObject<HTMLDivElement>,
  phase: GamePhase,
): void => {
  const enabled = phase !== "playing";

  useEffect(() => {
    if (!enabled) {
      return;
    }

    const container = containerRef.current;

    if (!container) {
      return;
    }

    const getFocusable = () =>
      Array.from(
        container.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
        ),
      ).filter((el) => !el.hasAttribute("disabled"));

    const previouslyFocused = document.activeElement as HTMLElement | null;
    const first = getFocusable()[0];

    first?.focus();

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Tab") {
        return;
      }

      const focusable = getFocusable();

      if (focusable.length === 0) {
        return;
      }

      const firstEl = focusable[0];
      const lastEl = focusable[focusable.length - 1];

      if (e.shiftKey && document.activeElement === firstEl) {
        e.preventDefault();
        lastEl.focus();
      } else if (!e.shiftKey && document.activeElement === lastEl) {
        e.preventDefault();
        firstEl.focus();
      }
    };

    container.addEventListener("keydown", onKeyDown);

    return () => {
      container.removeEventListener("keydown", onKeyDown);
      previouslyFocused?.focus();
    };
  }, [enabled, phase, containerRef]);
};

export const Screens = () => {
  const { phase, score, best } = useUnit($snake3d);
  const overlayRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const goHome = () => {
    toMenu();
    navigate("/");
  };

  useFocusTrap(overlayRef, phase);

  useEffect(() => {
    if (phase !== "playing") {
      return;
    }

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Escape") {
        pauseGame();
      }
    };

    window.addEventListener("keydown", onKeyDown);

    return () => window.removeEventListener("keydown", onKeyDown);
  }, [phase]);

  useEffect(() => {
    if (phase !== "paused") {
      return;
    }

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Escape") {
        resumeGame();
      }
    };

    window.addEventListener("keydown", onKeyDown);

    return () => window.removeEventListener("keydown", onKeyDown);
  }, [phase]);

  useEffect(() => {
    if (phase !== "menu" && phase !== "gameover") {
      return;
    }

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Space" || e.code === "Enter") {
        startGame();
      }
    };

    window.addEventListener("keydown", onKeyDown);

    return () => window.removeEventListener("keydown", onKeyDown);
  }, [phase]);

  if (phase === "menu") {
    return (
      <Overlay ref={overlayRef} role="dialog" aria-modal="true" aria-label="Главное меню">
        <Panel>
          <Title>ЗМЕЙКА 3D</Title>
          <Subtitle>Портфолио-игра Владислава Самсонова</Subtitle>
          <RulesList>
            <RulesItem>
              <strong>Движение</strong> — мышь или WASD
            </RulesItem>
            <RulesItem>
              <strong>Буст</strong> — зажми Space, чтобы разбивать оболочку еды
            </RulesItem>
            <RulesItem>
              <strong>Осколки</strong> — собирай их для роста и очков
            </RulesItem>
            <RulesItem>
              <strong>Стены</strong> — отнимают 1 HP, у тебя их 3
            </RulesItem>
          </RulesList>
          <Button onClick={() => startGame()}>Играть</Button>
          <SocialRow>
            {SOCIALS.map((social) => (
              <SocialIcon
                key={social.url}
                url={social.url}
                network={social.network}
                target="_blank"
                rel="noopener noreferrer"
              />
            ))}
          </SocialRow>
          <SecondaryButton onClick={goHome}>Назад</SecondaryButton>
        </Panel>
      </Overlay>
    );
  }

  if (phase === "paused") {
    return (
      <Overlay ref={overlayRef} role="dialog" aria-modal="true" aria-label="Пауза">
        <Panel>
          <Title>Пауза</Title>
          <ButtonRow>
            <Button onClick={() => resumeGame()}>Продолжить</Button>
            <SecondaryButton onClick={() => startGame()}>
              Заново
            </SecondaryButton>
            <SecondaryButton onClick={goHome}>Назад</SecondaryButton>
          </ButtonRow>
        </Panel>
      </Overlay>
    );
  }

  if (phase === "gameover") {
    return (
      <Overlay ref={overlayRef} role="dialog" aria-modal="true" aria-label="Игра окончена">
        <Panel>
          <Title>Игра окончена</Title>
          <ScoreText>
            Счёт: {score} <span>· Рекорд: {best}</span>
          </ScoreText>
          <ButtonRow>
            <Button onClick={() => startGame()}>Играть снова</Button>
            <SecondaryButton onClick={() => toMenu()}>В меню</SecondaryButton>
            <SecondaryButton onClick={goHome}>Назад</SecondaryButton>
          </ButtonRow>
        </Panel>
      </Overlay>
    );
  }

  return null;
};
