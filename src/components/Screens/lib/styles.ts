import styled from "styled-components";

export const Overlay = styled.div`
  position: fixed;
  inset: 0;
  z-index: 20;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${({ theme }) => theme.ui.overlay};
  font-family: "Exo 2", "Segoe UI", sans-serif;
  backdrop-filter: blur(3px);
`;

export const Panel = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 18px;
  padding: 44px 52px;
  max-width: 560px;
  text-align: center;
  background: ${({ theme }) => theme.ui.panel};
  border: 1px solid ${({ theme }) => theme.ui.panelBorder};
  border-radius: 16px;
  box-shadow: 0 0 40px rgba(56, 189, 248, 0.12);
`;

export const Title = styled.h1`
  margin: 0;
  font-size: 52px;
  font-weight: 900;
  letter-spacing: 4px;
  color: ${({ theme }) => theme.ui.text};
  text-shadow: 0 0 20px rgba(34, 197, 94, 0.5);
`;

export const Subtitle = styled.p`
  margin: 0;
  font-size: 16px;
  color: ${({ theme }) => theme.ui.textMuted};
`;

export const RulesList = styled.ul`
  margin: 0;
  padding: 0;
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 8px;
  font-size: 14px;
  color: ${({ theme }) => theme.ui.textMuted};
`;

export const RulesItem = styled.li`
  & strong {
    color: ${({ theme }) => theme.ui.text};
  }
`;

export const Button = styled.button`
  padding: 14px 42px;
  font-family: "Exo 2", "Segoe UI", sans-serif;
  font-size: 18px;
  font-weight: 800;
  letter-spacing: 2px;
  text-transform: uppercase;
  color: ${({ theme }) => theme.ui.overlay};
  background: ${({ theme }) => theme.ui.accent};
  border: none;
  border-radius: 10px;
  cursor: pointer;
  transition: transform 0.15s, box-shadow 0.15s;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 0 24px rgba(34, 197, 94, 0.6);
  }

  &:active {
    transform: translateY(0);
  }
`;

export const SecondaryButton = styled(Button)`
  background: transparent;
  color: ${({ theme }) => theme.ui.text};
  border: 1px solid ${({ theme }) => theme.ui.panelBorder};

  &:hover {
    box-shadow: 0 0 18px rgba(56, 189, 248, 0.4);
  }
`;

export const ButtonRow = styled.div`
  display: flex;
  gap: 14px;
  flex-wrap: wrap;
  justify-content: center;
`;

export const ScoreText = styled.p`
  margin: 0;
  font-size: 22px;
  font-weight: 700;
  color: ${({ theme }) => theme.ui.text};

  & span {
    color: ${({ theme }) => theme.ui.textMuted};
    font-weight: 600;
  }
`;

export const SocialRow = styled.div`
  display: flex;
  gap: 14px;
  margin-top: 6px;

  & a {
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    transition: transform 0.15s;
  }

  & a:hover {
    transform: translateY(-2px) scale(1.05);
  }
`;
