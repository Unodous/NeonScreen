import { useFetch } from "../hooks/useFetch.js";
import { getPopular, getNowPlaying, getTopRated } from "../api/tmdb.js";
import MovieSection from "../components/MovieSection/MovieSection.jsx";

function Home() {
  const popular = useFetch(() => getPopular());
  const nowPlaying = useFetch(() => getNowPlaying());
  const topRated = useFetch(() => getTopRated());

  return (
    <div className="container">
      <MovieSection
        title="Популярное"
        movies={popular.data?.results ?? []}
        loading={popular.loading}
        error={popular.error}
      />

      <MovieSection
        title="Сейчас в кино"
        movies={nowPlaying.data?.results ?? []}
        loading={nowPlaying.loading}
        error={nowPlaying.error}
      />

      <MovieSection
        title="Высокий рейтинг"
        movies={topRated.data?.results ?? []}
        loading={topRated.loading}
        error={topRated.error}
      />
    </div>
  );
}

export default Home;
