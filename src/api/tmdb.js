/**
 * Единственное место в проекте, которое знает про TMDB.
 * Компоненты вызывают готовые функции и ничего не знают ни про URL,
 * ни про токен — если API поменяется, править придётся только здесь.
 */

const BASE_URL = "https://api.themoviedb.org/3";
const TOKEN = import.meta.env.VITE_TMDB_TOKEN;

// Постеры лежат на отдельном CDN, размер задаётся прямо в пути
const IMAGE_BASE = "https://image.tmdb.org/t/p";

export function getPosterUrl(path, size = "w342") {
  // У части фильмов постера просто нет — отдаём null, карточка покажет заглушку
  return path ? `${IMAGE_BASE}/${size}${path}` : null;
}

export function getBackdropUrl(path, size = "w1280") {
  return path ? `${IMAGE_BASE}/${size}${path}` : null;
}

/**
 * Базовая обёртка над fetch: подставляет токен, язык и разбирает ошибки.
 */
async function request(endpoint, params = {}) {
  const url = new URL(BASE_URL + endpoint);
  url.searchParams.set("language", "ru-RU");

  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== "") {
      url.searchParams.set(key, value);
    }
  }

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      accept: "application/json",
    },
  });

  if (!response.ok) {
    // Разные коды — разные причины, человеку надо сказать понятное
    if (response.status === 401) {
      throw new Error("Неверный токен TMDB. Проверь файл .env");
    }
    if (response.status === 404) {
      throw new Error("Фильм не найден");
    }
    throw new Error(`Ошибка запроса: ${response.status}`);
  }

  return response.json();
}

export const getPopular = (page = 1) => request("/movie/popular", { page });

export const getNowPlaying = (page = 1) =>
  request("/movie/now_playing", { page });

export const getTopRated = (page = 1) => request("/movie/top_rated", { page });

export const getMovieDetails = (id) =>
  request(`/movie/${id}`, {
    append_to_response: "videos,credits,similar",
    // Без этого TMDB вернёт ролики только на русском, а их часто нет вообще —
    // разрешаем ещё и английские, иначе блок трейлера будет пустым у половины фильмов
    include_video_language: "ru,en",
  });

export const searchMovies = (query, page = 1) =>
  request("/search/movie", { query, page });
