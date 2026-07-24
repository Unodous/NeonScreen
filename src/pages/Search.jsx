import { useSearchParams } from "react-router-dom";
import { useFetch } from "../hooks/useFetch.js";
import { searchMovies } from "../api/tmdb.js";
import MovieSection from "../components/MovieSection/MovieSection.jsx";

function Search() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q") ?? "";

  // Пустой запрос не гоняем на сервер — просто отдаём пустой результат
  const { data, loading, error } = useFetch(
    () => (query ? searchMovies(query) : Promise.resolve({ results: [] })),
    [query],
  );

  const movies = data?.results ?? [];
  const nothingFound = !loading && !error && query && movies.length === 0;

  return (
    <div className="container">
      <MovieSection
        title={query ? `Результаты по запросу «${query}»` : "Поиск"}
        movies={movies}
        loading={loading}
        error={error}
      />

      {nothingFound && (
        <p
          style={{
            color: "var(--text-muted)",
            marginTop: "calc(-1 * var(--space-6))",
          }}
        >
          Ничего не нашлось. Попробуй другое название или проверь раскладку.
        </p>
      )}
    </div>
  );
}

export default Search;
