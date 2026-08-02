import { useEffect } from "react";
import { SocialIcon } from "react-social-icons";
import { useUnit } from "effector-react";
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

export const Screens = () => {
  const { phase, score, best } = useUnit($snake3d);

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
      <Overlay>
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
              />
            ))}
          </SocialRow>
        </Panel>
      </Overlay>
    );
  }

  if (phase === "paused") {
    return (
      <Overlay>
        <Panel>
          <Title>Пауза</Title>
          <ButtonRow>
            <Button onClick={() => resumeGame()}>Продолжить</Button>
            <SecondaryButton onClick={() => startGame()}>
              Заново
            </SecondaryButton>
          </ButtonRow>
        </Panel>
      </Overlay>
    );
  }

  if (phase === "gameover") {
    return (
      <Overlay>
        <Panel>
          <Title>Игра окончена</Title>
          <ScoreText>
            Счёт: {score} <span>· Рекорд: {best}</span>
          </ScoreText>
          <ButtonRow>
            <Button onClick={() => startGame()}>Играть снова</Button>
            <SecondaryButton onClick={() => toMenu()}>В меню</SecondaryButton>
          </ButtonRow>
        </Panel>
      </Overlay>
    );
  }

  return null;
};
