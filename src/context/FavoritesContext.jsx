import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";

const FavoritesContext = createContext(null);

// Префикс в ключе — чтобы не столкнуться с данными других сайтов на localhost
const STORAGE_KEY = "neonscreen:favorites";

/**
 * Читаем сохранённое один раз при старте.
 * В try/catch, потому что в хранилище может лежать битый JSON
 */
function readFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function FavoritesProvider({ children }) {
  // Функция вместо значения: так readFromStorage вызовется только
  // на первом рендере, а не на каждом
  const [favorites, setFavorites] = useState(readFromStorage);

  // Любое изменение списка сразу пишем в браузер — перезагрузка не потеряет данные
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites));
  }, [favorites]);

  const toggleFavorite = useCallback((movie) => {
    setFavorites((prev) => {
      const exists = prev.some((item) => item.id === movie.id);

      if (exists) {
        return prev.filter((item) => item.id !== movie.id);
      }

      // Храним только то, что нужно карточке и анализу вкуса.
      // Целый объект из API складывать незачем — localStorage ограничен
      const compact = {
        id: movie.id,
        title: movie.title,
        poster_path: movie.poster_path,
        release_date: movie.release_date,
        vote_average: movie.vote_average,
        // В списках TMDB жанры приходят массивом id, на странице фильма —
        // массивом объектов. Приводим к одному виду прямо здесь,
        // чтобы дальше по коду об этой разнице никто не думал
        genre_ids:
          movie.genre_ids ?? movie.genres?.map((genre) => genre.id) ?? [],
      };

      return [compact, ...prev];
    });
  }, []);

  const isFavorite = useCallback(
    (id) => favorites.some((item) => item.id === id),
    [favorites],
  );

  return (
    <FavoritesContext.Provider
      value={{ favorites, toggleFavorite, isFavorite }}
    >
      {children}
    </FavoritesContext.Provider>
  );
}

/**
 * Своя обёртка над useContext: короче в использовании и сразу подсказывает,
 * если компонент забыли обернуть провайдером
 */
export function useFavorites() {
  const context = useContext(FavoritesContext);

  if (!context) {
    throw new Error(
      "useFavorites можно вызывать только внутри FavoritesProvider",
    );
  }

  return context;
}
