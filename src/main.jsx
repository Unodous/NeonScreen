import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { FavoritesProvider } from "./context/FavoritesContext.jsx";
import "./index.css";
import App from "./App.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    {/* basename нужен, чтобы роутинг не сломался на GitHub Pages,
        где сайт лежит не в корне домена, а в /NeonScreen/ */}
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <FavoritesProvider>
        <App />
      </FavoritesProvider>
    </BrowserRouter>
  </StrictMode>,
);
