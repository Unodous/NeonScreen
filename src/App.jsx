import { Routes, Route } from "react-router-dom";
import Header from "./components/Header/Header.jsx";
import Home from "./pages/Home.jsx";
import Search from "./pages/Search.jsx";
import MovieDetails from "./pages/MovieDetails.jsx";
import Favorites from "./pages/Favorites.jsx";
import Dna from "./pages/Dna.jsx";
import NotFound from "./pages/NotFound.jsx";

function App() {
  return (
    <>
      <Header />

      {/* main вместо div — так скринридеры понимают, где основной контент */}
      <main
        style={{
          paddingTop: "var(--space-5)",
          paddingBottom: "var(--space-7)",
        }}
      >
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/search" element={<Search />} />
          <Route path="/movie/:id" element={<MovieDetails />} />
          <Route path="/favorites" element={<Favorites />} />
          <Route path="/dna" element={<Dna />} />
          {/* Звёздочка ловит все адреса, не совпавшие с предыдущими */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
    </>
  );
}

export default App;
