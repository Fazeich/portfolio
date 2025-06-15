import { Info } from "lucide-react";
import styled from "styled-components";

export const TitleWrapper = styled.div`
  display: flex;
  align-items: baseline;

  gap: 10px;

  @media (width <= 600px) {
    gap: 5px;
    flex-direction: column;
    align-items: center;
  }
`;

export const StyledInfoIcon = styled(Info)`
  cursor: pointer;

  &:hover {
    color: #17a2b8;
  }
`;

export const PageWrapper = styled.div<{ isVisibleHeader: boolean }>`
  width: 100vw;
  height: 100vh;

  margin-top: ${({ isVisibleHeader }) => (isVisibleHeader ? "75px" : 0)};

  transition: margin 0.25s ease-in-out;
`;
