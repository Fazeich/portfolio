import styled from "styled-components";

const Root = styled.div`
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 10;
  font-family: "Exo 2", sans-serif;
`;

const Title = styled.div`
  position: absolute;
  top: 26px;
  left: 32px;
`;

const TitleText = styled.div`
  color: ${({ theme }) => theme.town.title};
  font-size: 22px;
  font-weight: 800;
  letter-spacing: 0.18em;
  text-transform: uppercase;
`;

const Subtitle = styled.div`
  margin-top: 6px;
  color: ${({ theme }) => theme.town.hint};
  font-size: 13px;
  font-weight: 600;
  letter-spacing: 0.06em;
`;

const Hint = styled.div`
  position: absolute;
  bottom: 28px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: 8px;
  color: ${({ theme }) => theme.town.hint};
  font-size: 14px;
  font-weight: 600;
`;

const Key = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 26px;
  padding: 0 5px;
  height: 26px;
  background: ${({ theme }) => theme.town.key};
  color: ${({ theme }) => theme.town.keyText};
  border-radius: 4px;
  font-size: 13px;
  font-weight: 800;
`;

const Divider = styled.span`
  opacity: 0.5;
  margin: 0 2px;
`;

export const HubHud = () => (
  <Root>
    <Title>
      <TitleText>Portfolio</TitleText>
      <Subtitle>3D mini-games</Subtitle>
    </Title>

    <Hint>
      <Key>W</Key>
      <Key>A</Key>
      <Key>S</Key>
      <Key>D</Key>
      <span>движение</span>
      <Divider>·</Divider>
      <Key>E</Key>
      <span>вход в проект</span>
      <Divider>·</Divider>
      <Key>1</Key>
      <span>переключение персонажа</span>
    </Hint>
  </Root>
);
