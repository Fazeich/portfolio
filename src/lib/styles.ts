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

  button:focus-visible,
  a:focus-visible,
  [tabindex]:focus-visible {
    outline: 2px solid ${({ theme }) => theme.ui.accent};
    outline-offset: 3px;
  }
`;

export const PageWrapper = styled.div`
  position: fixed;
  inset: 0;
`;
