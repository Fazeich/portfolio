import { createRoot } from "react-dom/client";
import { StrictMode } from "react";
import { ThemeProvider } from "styled-components";
import { LIGHT_THEME } from "./lib/theme";
import axios from "axios";
import { BASE_ROUTE, OLD_BASE_URL } from "./lib/constants";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { PAGES } from "./lib/router";
import Header from "./widgets/Header";

axios.defaults.baseURL = OLD_BASE_URL;

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <ThemeProvider theme={LIGHT_THEME}>
      <BrowserRouter>
        <Header />

        <Routes>
          {PAGES.map((page) => (
            <Route
              path={`${BASE_ROUTE}${page.link}`}
              element={page.component}
              key={page.id}
            />
          ))}
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  </StrictMode>,
);
