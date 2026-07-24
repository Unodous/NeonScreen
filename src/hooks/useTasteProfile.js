import { useEffect, useState } from "react";
import { getPosterUrl } from "../api/tmdb.js";
import { extractDominantColor, fallbackColor } from "../utils/palette.js";
import { hashString } from "../utils/random.js";

// Больше двух десятков перекладин спираль не переварит визуально,
// да и грузить сотню постеров ради картинки — перебор
const MAX_ITEMS = 24;

/**
 * Превращает список избранного в компактный «профиль вкуса»:
 * цвета, рейтинги, годы, распределение по жанрам.
 */
export function useTasteProfile(favorites) {
  const [profile, setProfile] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);

  useEffect(() => {
    if (!favorites || favorites.length === 0) {
      setProfile(null);
      return;
    }

    let ignore = false;
    setAnalyzing(true);

    const selected = favorites.slice(0, MAX_ITEMS);

    // Постеры анализируются параллельно — последовательно это заняло бы
    // секунды вместо десятых долей
    Promise.all(
      selected.map(async (movie) => {
        const posterUrl = getPosterUrl(movie.poster_path, "w185");
        const seed = hashString(String(movie.id));
        const color = posterUrl ? await extractDominantColor(posterUrl) : null;

        return {
          r: Number(movie.vote_average ?? 0),
          y: movie.release_date ? Number(movie.release_date.slice(0, 4)) : null,
          c: color ?? fallbackColor(seed),
          s: seed % 100000,
        };
      }),
    ).then((items) => {
      if (ignore) return;
      setProfile(buildProfile(items, selected, favorites.length));
      setAnalyzing(false);
    });

    return () => {
      ignore = true;
    };
  }, [favorites]);

  return { profile, analyzing };
}

function buildProfile(items, selected, total) {
  const genreCounts = new Map();

  selected.forEach((movie) => {
    (movie.genre_ids ?? []).forEach((id) => {
      genreCounts.set(id, (genreCounts.get(id) ?? 0) + 1);
    });
  });

  // Шесть осей — предел читаемости радара
  const genres = [...genreCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6);

  const ratings = items.map((item) => item.r).filter((value) => value > 0);
  const years = items.map((item) => item.y).filter(Boolean);

  return {
    v: 1,
    items,
    genres,
    total,
    avg: ratings.length
      ? Number(
          (
            ratings.reduce((sum, value) => sum + value, 0) / ratings.length
          ).toFixed(1),
        )
      : 0,
    years: years.length ? [Math.min(...years), Math.max(...years)] : null,
  };
}
