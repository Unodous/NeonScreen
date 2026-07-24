import { NavLink } from "react-router-dom";
import styles from "./Header.module.css";

function Header() {
  // NavLink сам знает, активна ли ссылка, и отдаёт это через функцию в className
  const linkClass = ({ isActive }) =>
    isActive ? `${styles.link} ${styles.linkActive}` : styles.link;

  return (
    <header className={styles.header}>
      <div className={`container ${styles.inner}`}>
        <NavLink to="/" className={styles.logo}>
          Neon<span className={styles.logoAccent}>Screen</span>
        </NavLink>

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
