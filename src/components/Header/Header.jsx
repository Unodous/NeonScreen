import { NavLink } from "react-router-dom";
import SearchBar from "../SearchBar/SearchBar.jsx";
import { useFavorites } from "../../context/FavoritesContext.jsx";
import styles from "./Header.module.css";

// Ниже этого числа ссылку на ДНК не показываем — рисовать нечего
const MIN_FOR_DNA = 3;

function Header() {
  const { favorites } = useFavorites();

  const linkClass = ({ isActive }) =>
    isActive ? `${styles.link} ${styles.linkActive}` : styles.link;

  return (
    <header className={styles.header}>
      <div className={`container ${styles.inner}`}>
        <NavLink to="/" className={styles.logo}>
          Neon<span className={styles.logoAccent}>Screen</span>
        </NavLink>

        <SearchBar />

        <nav>
          <ul className={styles.nav}>
            <li>
              <NavLink to="/" className={linkClass} end>
                Главная
              </NavLink>
            </li>
            <li>
              <NavLink to="/favorites" className={linkClass}>
                Избранное
                {/* Счётчик появляется только когда есть что считать */}
                {favorites.length > 0 && (
                  <span className={styles.badge}>{favorites.length}</span>
                )}
              </NavLink>
            </li>

            {/* Пункт возникает сам, как только набралось достаточно фильмов —
                пустую страницу пользователю не показываем */}
            {favorites.length >= MIN_FOR_DNA && (
              <li>
                <NavLink
                  to="/dna"
                  className={({ isActive }) =>
                    `${linkClass({ isActive })} ${styles.dna}`
                  }
                >
                  Кино-ДНК
                </NavLink>
              </li>
            )}
          </ul>
        </nav>
      </div>
    </header>
  );
}

export default Header;
