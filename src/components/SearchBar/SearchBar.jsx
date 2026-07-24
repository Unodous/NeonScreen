import { useState, useEffect } from "react";
import { useNavigate, useLocation, useSearchParams } from "react-router-dom";
import { useDebounce } from "../../hooks/useDebounce.js";
import styles from "./SearchBar.module.css";

function SearchBar() {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();

  // Если человек пришёл по ссылке с готовым запросом — подставляем его в поле
  const [value, setValue] = useState(searchParams.get("q") ?? "");
  const debouncedValue = useDebounce(value, 500);

  useEffect(() => {
    const query = debouncedValue.trim();

    if (query) {
      // replace вместо push, иначе кнопка «назад» будет отматывать
      // каждую промежуточную букву запроса
      navigate(`/search?q=${encodeURIComponent(query)}`, { replace: true });
    } else if (location.pathname === "/search") {
      // Поле очистили — возвращаем на главную
      navigate("/", { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedValue]);

  const handleSubmit = (event) => {
    // Enter должен искать сразу, не дожидаясь таймера
    event.preventDefault();
    const query = value.trim();
    if (query) navigate(`/search?q=${encodeURIComponent(query)}`);
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit} role="search">
      <input
        type="search"
        className={styles.input}
        placeholder="Поиск фильмов…"
        aria-label="Поиск фильмов"
        value={value}
        onChange={(event) => setValue(event.target.value)}
      />
    </form>
  );
}

export default SearchBar;
