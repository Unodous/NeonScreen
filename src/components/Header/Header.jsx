import { NavLink } from "react-router-dom";
import SearchBar from "../SearchBar/SearchBar.jsx";
import styles from "./Header.module.css";

function Header() {
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
              </NavLink>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
}

export default Header;
