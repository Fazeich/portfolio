import styled from "styled-components";

export const IntroduceWrapper = styled.div`
  width: 100%;
  height: 100%;

  display: flex;
  flex-direction: column;

  align-items: center;
  justify-content: center;

  text-align: center;

  gap: 30px;

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
