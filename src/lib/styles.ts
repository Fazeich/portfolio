import { createGlobalStyle, styled } from "styled-components";

export const GlobalStyle = createGlobalStyle`
  html,
  body,
  #root {
    height: 100%;
    margin: 0;
    overflow: hidden;
    background: ${({ theme }) => theme.arena.background};
  }
`;

export const PageWrapper = styled.div`
  position: fixed;
  inset: 0;
`;
