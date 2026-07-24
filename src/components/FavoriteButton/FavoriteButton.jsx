import { useFavorites } from "../../context/FavoritesContext.jsx";
import styles from "./FavoriteButton.module.css";

/**
 * Кнопка-сердце. Работает и на карточке в списке, и на странице фильма —
 * отличается только размером.
 */
function FavoriteButton({ movie, size = "small" }) {
  const { toggleFavorite, isFavorite } = useFavorites();
  const active = isFavorite(movie.id);

  function handleClick(event) {
    // Карточка целиком обёрнута в ссылку. Без этих двух строк
    // клик по сердцу утащил бы нас на страницу фильма
    event.preventDefault();
    event.stopPropagation();

    toggleFavorite(movie);
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`${styles.button} ${styles[size]} ${active ? styles.active : ""}`}
      // aria-pressed сообщает скринридеру, что кнопка — переключатель,
      // и в каком она сейчас положении
      aria-pressed={active}
      aria-label={
        active
          ? `Убрать «${movie.title}» из избранного`
          : `Добавить «${movie.title}» в избранное`
      }
      title={active ? "В избранном" : "В избранное"}
    >
      <svg viewBox="0 0 24 24" aria-hidden="true" className={styles.icon}>
        <path d="M12 21s-7.5-4.9-9.6-9.2C.7 8.4 2.4 4.8 5.9 4.1c2-.4 4 .4 5.1 2 .1.1.2.3.3.5.1-.2.2-.4.3-.5 1.1-1.6 3.1-2.4 5.1-2 3.5.7 5.2 4.3 3.5 7.7C19.5 16.1 12 21 12 21z" />
      </svg>
    </button>
  );
}

export default FavoriteButton;
