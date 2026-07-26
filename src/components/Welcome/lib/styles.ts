import { ChevronDown } from "lucide-react";
import styled from "styled-components";

export const WelcomeWrapper = styled.div`
  width: 100%;
  height: 100%;

  display: flex;
  flex-direction: column;

  align-items: center;
  justify-content: center;

  gap: 35px;

  text-align: center;

  .smooth_text {
    @keyframes smooth {
      from {
        opacity: 0;
      }
      to {
        opacity: 1;
      }
    }

    animation: smooth 3s normal;
  }
`;

export const BouncingArrow = styled(ChevronDown)`
  position: absolute;

  bottom: 15px;

  width: 45px;
  height: 45px;

  cursor: pointer;

  @keyframes bounce {
    0%,
    100% {
      transform: translateY(-40%);
      animation-timing-function: cubic-bezier(0.8, 0, 1, 1);
    }
    50% {
      transform: none;
      animation-timing-function: cubic-bezier(0, 0, 0.2, 1);
    }
  }

  animation: bounce 1s infinite;
`;
