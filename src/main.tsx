import { createRoot } from "react-dom/client";
import { StrictMode } from "react";
import { ThemeProvider } from "styled-components";
import { SnakePage } from "@/pages/Snake";
import { GlobalStyle } from "@/lib/styles";
import { GAME_THEME } from "@/lib/theme";

createRoot(document.getElementById("root") as HTMLElement).render(
  <StrictMode>
    <ThemeProvider theme={GAME_THEME}>
      <GlobalStyle />
      <SnakePage />
    </ThemeProvider>
  </StrictMode>,
);
