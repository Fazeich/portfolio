import styled from "styled-components";

export const HudWrapper = styled.div`
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 10;
  font-family: "Exo 2", "Segoe UI", sans-serif;
`;

export const ScorePanel = styled.div`
  position: absolute;
  top: 24px;
  left: 28px;
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

export const ScoreLabel = styled.span`
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 2px;
  text-transform: uppercase;
  color: ${({ theme }) => theme.ui.textMuted};
`;

export const ScoreValue = styled.span`
  font-size: 34px;
  font-weight: 800;
  color: ${({ theme }) => theme.ui.text};
`;

export const BestValue = styled.span`
  font-size: 14px;
  font-weight: 600;
  color: ${({ theme }) => theme.ui.textMuted};
`;

export const HpPanel = styled.div`
  position: absolute;
  top: 24px;
  right: 28px;
  display: flex;
  gap: 10px;
  align-items: center;
`;

export const Heart = styled.span<{ filled: boolean }>`
  font-size: 26px;
  line-height: 1;
  color: ${({ theme, filled }) =>
    filled ? theme.ui.danger : theme.ui.panelBorder};
  filter: ${({ filled }) => (filled ? "drop-shadow(0 0 6px rgba(239,68,68,0.6))" : "none")};
  transition: color 0.2s;
`;

export const BoostWrapper = styled.div`
  position: absolute;
  bottom: 32px;
  left: 50%;
  transform: translateX(-50%);
  width: 320px;
  max-width: 70vw;
`;

export const BoostLabel = styled.div`
  display: flex;
  justify-content: space-between;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 2px;
  text-transform: uppercase;
  color: ${({ theme }) => theme.ui.textMuted};
  margin-bottom: 6px;
`;

export const BoostTrack = styled.div`
  height: 10px;
  border-radius: 6px;
  background: ${({ theme }) => theme.ui.panel};
  border: 1px solid ${({ theme }) => theme.ui.panelBorder};
  overflow: hidden;
`;

export const BoostFill = styled.div`
  height: 100%;
  width: 100%;
  border-radius: 6px;
  background: ${({ theme }) => theme.ui.accent};
`;
