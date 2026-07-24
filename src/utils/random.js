/**
 * FNV-1a — быстрый хеш строки в 32-битное число.
 * Нужен, чтобы из id фильма получить стабильное «зерно» для генератора.
 */
export function hashString(input) {
  let hash = 2166136261;

  for (let i = 0; i < input.length; i += 1) {
    hash ^= input.charCodeAt(i);
    // Math.imul даёт настоящее 32-битное умножение с переполнением,
    // обычный * потерял бы точность на больших числах
    hash = Math.imul(hash, 16777619);
  }

  return hash >>> 0;
}

/**
 * Mulberry32 — генератор псевдослучайных чисел на одном 32-битном состоянии.
 * От Math.random отличается главным: с одинаковым зерном выдаёт
 * одинаковую последовательность. Именно поэтому ДНК не «прыгает»
 * при каждой перезагрузке страницы.
 */
export function mulberry32(seed) {
  let state = seed >>> 0;

  return function next() {
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
