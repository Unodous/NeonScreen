import { useParams, Link } from "react-router-dom";
import { useFetch } from "../hooks/useFetch.js";
import { getMovieDetails, getPosterUrl, getBackdropUrl } from "../api/tmdb.js";
import styles from "./MovieDetails.module.css";

function MovieDetails() {
  const { id } = useParams();

  // id в deps: без него при переходе на другой фильм данные не перезапросятся
  const {
    data: movie,
    loading,
    error,
  } = useFetch(() => getMovieDetails(id), [id]);

  if (loading)
    return (
      <div className="container">
        <p className={styles.state}>Загружаем…</p>
      </div>
    );
  if (error)
    return (
      <div className="container">
        <p className={styles.error}>{error}</p>
      </div>
    );
  if (!movie) return null;

  const backdrop = getBackdropUrl(movie.backdrop_path);
  const poster = getPosterUrl(movie.poster_path, "w500");
  const year = movie.release_date ? movie.release_date.slice(0, 4) : null;

  // Приходит числом в минутах, показываем в привычном виде
  const runtime = movie.runtime
    ? `${Math.floor(movie.runtime / 60)} ч ${movie.runtime % 60} мин`
    : null;

  return (
    <article>
      <div className={styles.hero}>
        {backdrop && (
          <div
            className={styles.backdrop}
            style={{ backgroundImage: `url(${backdrop})` }}
          />
        )}

        <div className={`container ${styles.heroInner}`}>
          {poster && (
            <img
              src={poster}
              alt={`Постер фильма «${movie.title}»`}
              className={styles.poster}
            />
          )}

          <div className={styles.info}>
            <Link to="/" className={styles.back}>
              ← К каталогу
            </Link>

            <h1 className={styles.title}>{movie.title}</h1>

            {movie.tagline && <p className={styles.tagline}>{movie.tagline}</p>}

            <div className={styles.meta}>
              {movie.vote_average > 0 && (
                <span className={styles.score}>
                  {movie.vote_average.toFixed(1)}
                </span>
              )}
              {year && <span>{year}</span>}
              {runtime && <span>{runtime}</span>}
              {movie.original_title !== movie.title && (
                <span>{movie.original_title}</span>
              )}
            </div>

            {movie.genres?.length > 0 && (
              <ul className={styles.genres}>
                {movie.genres.map((genre) => (
                  <li key={genre.id} className={styles.genre}>
                    {genre.name}
                  </li>
                ))}
              </ul>
            )}

            {movie.overview && (
              <p className={styles.overview}>{movie.overview}</p>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}

export default MovieDetails;
