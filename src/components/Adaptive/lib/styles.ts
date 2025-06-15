import Paragraph from "@/shared/Paragraph";
import styled from "styled-components";

export const AdaptiveWrapper = styled.div`
  width: 100%;
  height: 100%;

  padding: 1rem;

  display: flex;
  flex-direction: column;

  align-items: center;
  justify-content: center;

  text-align: center;

  gap: 50px;

  background-color: ${({ theme }) => theme.secondary.background};

  user-select: none;
`;

export const FloatingWrap = styled.div`
  height: 100%;
  width: 100%;

  padding: 2rem;

  display: flex;
  align-items: center;

  justify-content: flex-start;
`;

export const TooltipWrapper = styled.div`
  display: flex;
  flex-direction: column;

  text-align: center;

  gap: 5px;
`;

export const ResizableWrapper = styled.div`
  height: 100%;
  min-width: 100px;

  display: flex;

  align-items: center;
`;

export const GripWrapper = styled.div`
  width: 60px;
  height: 100%;

  display: flex;
  flex-direction: column;

  align-items: center;
  justify-content: center;
`;

export const ContentWrapper = styled.div<{ width?: number }>`
  height: 100%;

  width: ${({ width }) => `${width}px`};

  box-shadow: 0 0 10px 5px #aaaaaa;
  padding: 0.5rem;

  display: flex;
  flex-direction: column;

  gap: 1rem;

  border-radius: 8px;
`;

export const FlexContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
`;

export const BaseCard = styled.div`
  padding: 1.5rem;
  border-radius: 0.5rem;
  color: white;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.5);

  min-height: 80px;
`;

export const StyledTitle = styled(Paragraph)`
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

export const LargeCard = styled(BaseCard)`
  width: 100%;
  padding: 2rem;
`;

export const MediumCard = styled(BaseCard)`
  flex: 1;
  min-width: 400px;
`;

export const SmallCard = styled(BaseCard)`
  flex: 1;
  min-width: 200px;
  padding: 1rem;
`;
