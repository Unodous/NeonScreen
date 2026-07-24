import { Link } from "react-router-dom";
import { getPosterUrl } from "../../api/tmdb.js";
import FavoriteButton from "../FavoriteButton/FavoriteButton.jsx";
import styles from "./MovieCard.module.css";

function MovieCard({ movie }) {
  const poster = getPosterUrl(movie.poster_path);
  const year = movie.release_date ? movie.release_date.slice(0, 4) : "—";
  const rating = movie.vote_average ? movie.vote_average.toFixed(1) : null;

  // Цвет плашки по рейтингу: сразу видно, стоит ли смотреть
  const ratingClass =
    movie.vote_average >= 7
      ? styles.ratingHigh
      : movie.vote_average >= 5
        ? styles.ratingMid
        : styles.ratingLow;

  return (
    <Link to={`/movie/${movie.id}`} className={styles.card}>
      <div className={styles.posterWrap}>
        {poster ? (
          <img
            src={poster}
            alt={`Постер фильма «${movie.title}»`}
            className={styles.poster}
            loading="lazy"
          />
        ) : (
          <div className={styles.noPoster}>Нет постера</div>
        )}

        {/* Кнопка лежит внутри posterWrap — позиционируется от постера,
            а не от всей карточки */}
        <div className={styles.favorite}>
          <FavoriteButton movie={movie} />
        </div>

        {rating && (
          <span className={`${styles.rating} ${ratingClass}`}>{rating}</span>
        )}
      </div>

      <h3 className={styles.title}>{movie.title}</h3>
      <span className={styles.year}>{year}</span>
    </Link>
  );
}

export default MovieCard;
