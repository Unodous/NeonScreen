// Запасные цвета на случай, если пиксели постера прочитать не удалось
const FALLBACK_COLORS = ["#00f0ff", "#ff2e97", "#b6ff3c", "#8b5cf6", "#ff8a3d"];

export function fallbackColor(seed) {
  return FALLBACK_COLORS[seed % FALLBACK_COLORS.length];
}

/**
 * Достаёт доминирующий цвет постера.
 *
 * Схема: грузим картинку → рисуем в невидимый canvas 40×40 →
 * читаем массив пикселей → раскладываем по корзинам похожих оттенков →
 * побеждает корзина с наибольшим весом.
 *
 * Возвращает hex-строку либо null, если браузер запретил читать пиксели.
 */
export function extractDominantColor(imageUrl) {
  return new Promise((resolve) => {
    const image = new Image();

    // Без этого браузер «пометит» canvas как заражённый чужими данными
    // и getImageData бросит ошибку безопасности
    image.crossOrigin = "anonymous";

    image.onload = () => {
      try {
        const size = 40;
        const canvas = document.createElement("canvas");
        canvas.width = size;
        canvas.height = size;

        const ctx = canvas.getContext("2d", { willReadFrequently: true });
        ctx.drawImage(image, 0, 0, size, size);

        const { data } = ctx.getImageData(0, 0, size, size);
        const buckets = new Map();

        // Пиксели лежат плоским массивом: r, g, b, a, r, g, b, a...
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          const alpha = data[i + 3];

          if (alpha < 128) continue;

          const max = Math.max(r, g, b);
          const min = Math.min(r, g, b);
          const lightness = (max + min) / 2;

          // Почти чёрное и почти белое есть в каждом постере и всегда
          // побеждало бы по количеству — выкидываем
          if (lightness < 40 || lightness > 225) continue;

          const saturation =
            max === min ? 0 : (max - min) / (255 - Math.abs(max + min - 255));

          // Серое тоже не годится: цвет должен быть выразительным
          if (saturation < 0.18) continue;

          // Сдвиг на 5 бит огрубляет каждый канал до 8 градаций.
          // Похожие оттенки попадают в одну корзину и суммируются
          const key = `${r >> 5}-${g >> 5}-${b >> 5}`;
          const bucket = buckets.get(key) ?? { r: 0, g: 0, b: 0, weight: 0 };

          // Насыщенные пиксели весят больше обычных
          const weight = 1 + saturation * 2;

          bucket.r += r * weight;
          bucket.g += g * weight;
          bucket.b += b * weight;
          bucket.weight += weight;

          buckets.set(key, bucket);
        }

        let winner = null;
        for (const bucket of buckets.values()) {
          if (!winner || bucket.weight > winner.weight) winner = bucket;
        }

        if (!winner) {
          resolve(null);
          return;
        }

        const r = Math.round(winner.r / winner.weight);
        const g = Math.round(winner.g / winner.weight);
        const b = Math.round(winner.b / winner.weight);

        resolve(boostColor(r, g, b));
      } catch {
        // Сервер картинок не разрешил чтение пикселей — не страшно,
        // выше по стеку подставится запасной цвет
        resolve(null);
      }
    };

    image.onerror = () => resolve(null);
    image.src = imageUrl;
  });
}

/**
 * Поднимаем насыщенность и выравниваем яркость: усреднённый цвет
 * почти всегда выходит мутным, а на чёрном фоне нужен неон
 */
function boostColor(r, g, b) {
  const [h, s, l] = rgbToHsl(r, g, b);
  const saturation = Math.max(s, 0.7);
  const lightness = Math.min(Math.max(l, 0.45), 0.62);
  return hslToHex(h, saturation, lightness);
}

function rgbToHsl(r, g, b) {
  const red = r / 255;
  const green = g / 255;
  const blue = b / 255;

  const max = Math.max(red, green, blue);
  const min = Math.min(red, green, blue);
  const delta = max - min;
  const lightness = (max + min) / 2;

  if (delta === 0) return [0, 0, lightness];

  const saturation =
    lightness > 0.5 ? delta / (2 - max - min) : delta / (max + min);

  let hue;
  if (max === red) hue = ((green - blue) / delta + (green < blue ? 6 : 0)) / 6;
  else if (max === green) hue = ((blue - red) / delta + 2) / 6;
  else hue = ((red - green) / delta + 4) / 6;

  return [hue, saturation, lightness];
}

function hslToHex(h, s, l) {
  const chroma = (1 - Math.abs(2 * l - 1)) * s;
  const second = chroma * (1 - Math.abs(((h * 6) % 2) - 1));
  const offset = l - chroma / 2;

  const sector = Math.floor(h * 6) % 6;
  const table = [
    [chroma, second, 0],
    [second, chroma, 0],
    [0, chroma, second],
    [0, second, chroma],
    [second, 0, chroma],
    [chroma, 0, second],
  ];

  const [r, g, b] = table[sector].map((value) =>
    Math.round((value + offset) * 255),
  );

  const toHex = (value) => value.toString(16).padStart(2, "0");
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}
