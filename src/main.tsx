import { createRoot } from "react-dom/client";
import { lazy, StrictMode, Suspense } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { ThemeProvider } from "styled-components";
import { GlobalStyle } from "@/lib/styles";
import { GAME_THEME } from "@/lib/theme";
import "@/index.css";

const PortfolioPage = lazy(() =>
  import("@/pages/Portfolio").then(({ PortfolioPage }) => ({
    default: PortfolioPage,
  })),
);
const SnakePage = lazy(() =>
  import("@/pages/Snake").then(({ SnakePage }) => ({ default: SnakePage })),
);
const LettersPage = lazy(() =>
  import("@/pages/Letters").then(({ LettersPage }) => ({
    default: LettersPage,
  })),
);

createRoot(document.getElementById("root") as HTMLElement).render(
  <StrictMode>
    <ThemeProvider theme={GAME_THEME}>
      <GlobalStyle />
      <BrowserRouter basename="/portfolio">
        <Suspense fallback={null}>
          <Routes>
            <Route path="/" element={<PortfolioPage />} />
            <Route path="/snake" element={<SnakePage />} />
            <Route path="/letters" element={<LettersPage />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </ThemeProvider>
  </StrictMode>,
);
