import { Link } from "react-router-dom";
import { useFavorites } from "../context/FavoritesContext.jsx";
import MovieCard from "../components/MovieCard/MovieCard.jsx";
import styles from "./Favorites.module.css";

// Минимум для осмысленной ДНК — тот же порог, что и на самой странице
const MIN_FOR_DNA = 3;

function Favorites() {
  // Данные лежат в localStorage, запросов к API здесь нет вообще —
  // поэтому ни загрузки, ни обработки ошибок не требуется
  const { favorites } = useFavorites();

  if (favorites.length === 0) {
    return (
      <main className={styles.page}>
        <div className="container">
          <div className={styles.empty}>
            <h2 className={styles.emptyTitle}>В избранном пусто</h2>
            <p className={styles.emptyText}>
              Наведи курсор на постер и нажми сердце — фильм появится здесь и
              останется после перезагрузки.
            </p>
            <Link to="/" className={styles.button}>
              К фильмам
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className={styles.page}>
      <div className="container">
        <div className={styles.head}>
          <h1 className={styles.title}>Избранное</h1>
          <span className={styles.count}>{favorites.length} шт.</span>

          {favorites.length >= MIN_FOR_DNA && (
            <Link to="/dna" className={styles.dnaLink}>
              Собрать Кино-ДНК
            </Link>
          )}
        </div>

        <div className={styles.grid}>
          {favorites.map((movie) => (
            <MovieCard key={movie.id} movie={movie} />
          ))}
        </div>
      </div>
    </main>
  );
}

export default Favorites;
