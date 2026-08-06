import { createRoot } from "react-dom/client";
import { StrictMode } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { ThemeProvider } from "styled-components";
import { PortfolioPage } from "@/pages/Portfolio";
import { SnakePage } from "@/pages/Snake";
import { LettersPage } from "@/pages/Letters";
import { GlobalStyle } from "@/lib/styles";
import { GAME_THEME } from "@/lib/theme";
import "@/index.css";

createRoot(document.getElementById("root") as HTMLElement).render(
  <StrictMode>
    <ThemeProvider theme={GAME_THEME}>
      <GlobalStyle />
      <BrowserRouter basename="/portfolio">
        <Routes>
          <Route path="/" element={<PortfolioPage />} />
          <Route path="/snake" element={<SnakePage />} />
          <Route path="/letters" element={<LettersPage />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  </StrictMode>,
);
