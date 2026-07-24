import MovieCard from "../MovieCard/MovieCard.jsx";
import styles from "./MovieSection.module.css";

function MovieSection({ title, movies, loading, error }) {
  return (
    <section className={styles.section}>
      <h2 className={styles.heading}>{title}</h2>

      {loading && <p className={styles.state}>Загружаем…</p>}

      {error && <p className={styles.error}>{error}</p>}

      {!loading && !error && (
        <div className={styles.grid}>
          {movies.map((movie) => (
            <MovieCard key={movie.id} movie={movie} />
          ))}
        </div>
      )}
    </section>
  );
}

export default MovieSection;
