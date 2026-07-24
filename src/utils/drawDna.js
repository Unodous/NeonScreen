import { getGenreName } from "../api/genres.js";
import { mulberry32 } from "./random.js";

// Вертикальный формат 4:5 — такая картинка лучше всего выглядит
// в соцсетях и мессенджерах
export const DNA_WIDTH = 1080;
export const DNA_HEIGHT = 1350;

const BG = "#0a0a0f";
const NEON = "#00f0ff";
const MAGENTA = "#ff2e97";
const LIME = "#b6ff3c";
const TEXT = "#e6e6f0";
const MUTED = "#9a9ab0";

/**
 * Рисует всю карточку кино-ДНК.
 *
 * Функция намеренно ничего не знает ни про React, ни про API —
 * только canvas и объект с данными. Благодаря этому один и тот же
 * код рисует и твою ДНК, и чужую, распакованную из ссылки.
 */
export function drawDna(canvas, profile, options = {}) {
  const ctx = canvas.getContext("2d");

  canvas.width = DNA_WIDTH;
  canvas.height = DNA_HEIGHT;

  drawBackground(ctx);
  drawHeading(ctx, options.author);
  drawHelix(ctx, profile);
  drawRadar(ctx, profile);
  drawStats(ctx, profile);
  drawFooter(ctx);
}

/**
 * Свечение в canvas делается тенью того же цвета, что и фигура.
 * Оборачиваем в save/restore, чтобы тень не утекла на следующие вызовы
 */
function glow(ctx, color, blur, draw) {
  ctx.save();
  ctx.shadowColor = color;
  ctx.shadowBlur = blur;
  draw();
  ctx.restore();
}

function drawBackground(ctx) {
  ctx.fillStyle = BG;
  ctx.fillRect(0, 0, DNA_WIDTH, DNA_HEIGHT);

  // Та же сетка, что на сайте — картинка должна узнаваться
  // как часть NeonScreen даже без логотипа
  ctx.strokeStyle = "rgba(0, 240, 255, 0.05)";
  ctx.lineWidth = 1;

  for (let x = 0; x <= DNA_WIDTH; x += 45) {
    ctx.beginPath();
    // Половинный пиксель: без него тонкая линия размазывается на два
    ctx.moveTo(x + 0.5, 0);
    ctx.lineTo(x + 0.5, DNA_HEIGHT);
    ctx.stroke();
  }

  for (let y = 0; y <= DNA_HEIGHT; y += 45) {
    ctx.beginPath();
    ctx.moveTo(0, y + 0.5);
    ctx.lineTo(DNA_WIDTH, y + 0.5);
    ctx.stroke();
  }

  // Затемнение к краям собирает внимание к центру
  const vignette = ctx.createRadialGradient(540, 620, 200, 540, 620, 900);
  vignette.addColorStop(0, "rgba(0, 0, 0, 0)");
  vignette.addColorStop(1, "rgba(0, 0, 0, 0.65)");
  ctx.fillStyle = vignette;
  ctx.fillRect(0, 0, DNA_WIDTH, DNA_HEIGHT);

  ctx.strokeStyle = "rgba(0, 240, 255, 0.35)";
  ctx.lineWidth = 2;
  ctx.strokeRect(24.5, 24.5, DNA_WIDTH - 49, DNA_HEIGHT - 49);
}

function drawHeading(ctx, author) {
  ctx.textAlign = "center";
  ctx.textBaseline = "alphabetic";

  ctx.fillStyle = TEXT;
  ctx.font = "700 78px 'Chakra Petch', sans-serif";
  glow(ctx, NEON, 30, () => ctx.fillText("КИНО-ДНК", 540, 140));

  ctx.font = "400 24px Inter, sans-serif";
  ctx.fillStyle = MUTED;
  ctx.fillText(
    author
      ? `визуальный отпечаток вкуса · ${author}`
      : "визуальный отпечаток вкуса",
    540,
    186,
  );
}

/**
 * Двойная спираль. Геометрия простая: две синусоиды в противофазе,
 * между ними перекладины — по одной на фильм.
 *
 * Трёхмерность имитируется косинусом того же угла: когда синус даёт
 * крайнее положение по горизонтали, косинус близок к нулю — значит,
 * точка «сбоку» и её надо приглушить.
 */
function drawHelix(ctx, profile) {
  const items = profile.items ?? [];
  if (items.length === 0) return;

  const top = 250;
  const bottom = 950;
  const centerX = 540;
  const amplitude = 200;
  const turns = 2.2;

  // Фаза зависит от состава избранного: разные наборы фильмов —
  // разный поворот спирали, одинаковые — один и тот же
  const seed = items.reduce((acc, item) => (acc ^ item.s) >>> 0, 9176);
  const phase = mulberry32(seed)() * Math.PI * 2;

  const angleAt = (t) => phase + t * Math.PI * 2 * turns;

  drawStrand(ctx, {
    top,
    bottom,
    centerX,
    amplitude,
    angleAt,
    shift: 0,
    color: NEON,
  });
  drawStrand(ctx, {
    top,
    bottom,
    centerX,
    amplitude,
    angleAt,
    shift: Math.PI,
    color: MAGENTA,
  });

  items.forEach((item, index) => {
    const t = items.length === 1 ? 0.5 : index / (items.length - 1);
    const y = top + t * (bottom - top);
    const angle = angleAt(t);
    const offset = Math.sin(angle) * amplitude;

    const x1 = centerX + offset;
    const x2 = centerX - offset;
    const depth = (Math.cos(angle) + 1) / 2;

    // Перекладина ярче по краям и прозрачнее в середине —
    // так читается объём и не забивается центр
    const gradient = ctx.createLinearGradient(x1, y, x2, y);
    gradient.addColorStop(0, item.c);
    gradient.addColorStop(0.5, withAlpha(item.c, 0.3));
    gradient.addColorStop(1, item.c);

    ctx.save();
    ctx.globalAlpha = 0.45 + depth * 0.55;
    ctx.strokeStyle = gradient;
    ctx.lineWidth = 2 + depth * 3;
    ctx.beginPath();
    ctx.moveTo(x1, y);
    ctx.lineTo(x2, y);
    ctx.stroke();
    ctx.restore();

    // Размер узла — рейтинг фильма. Шедевры видно издалека
    const radius = (6 + (item.r / 10) * 12) * (0.6 + depth * 0.4);
    drawNode(ctx, x1, y, radius, item.c, depth);
    drawNode(ctx, x2, y, radius * 0.7, item.c, depth);
  });
}

function drawStrand(
  ctx,
  { top, bottom, centerX, amplitude, angleAt, shift, color },
) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = 3;
  ctx.globalAlpha = 0.8;
  ctx.shadowColor = color;
  ctx.shadowBlur = 18;

  ctx.beginPath();
  // Шаг в три пикселя: кривая выглядит гладкой, а точек втрое меньше
  for (let y = top; y <= bottom; y += 3) {
    const t = (y - top) / (bottom - top);
    const x = centerX + Math.sin(angleAt(t) + shift) * amplitude;

    if (y === top) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.stroke();
  ctx.restore();
}

function drawNode(ctx, x, y, radius, color, depth) {
  ctx.save();
  ctx.globalAlpha = 0.5 + depth * 0.5;
  ctx.fillStyle = color;
  ctx.shadowColor = color;
  ctx.shadowBlur = 20;
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function withAlpha(hex, alpha) {
  const value = hex.replace("#", "");
  const r = parseInt(value.slice(0, 2), 16);
  const g = parseInt(value.slice(2, 4), 16);
  const b = parseInt(value.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/**
 * Радар жанров — многоугольник, где каждая ось это жанр,
 * а удалённость от центра — сколько таких фильмов в избранном
 */
function drawRadar(ctx, profile) {
  const genres = profile.genres ?? [];
  // На двух осях многоугольник вырождается в отрезок
  if (genres.length < 3) return;

  const radius = 112;
  const maxCount = Math.max(...genres.map(([, count]) => count));
  const step = (Math.PI * 2) / genres.length;

  // -PI/2 разворачивает первую ось строго вверх
  const angleOf = (index) => -Math.PI / 2 + index * step;

  ctx.save();
  ctx.translate(272, 1120);

  ctx.strokeStyle = "rgba(0, 240, 255, 0.18)";
  ctx.lineWidth = 1;

  for (let ring = 1; ring <= 3; ring += 1) {
    const r = (radius / 3) * ring;
    ctx.beginPath();
    genres.forEach((_, index) => {
      const x = Math.cos(angleOf(index)) * r;
      const y = Math.sin(angleOf(index)) * r;
      if (index === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.closePath();
    ctx.stroke();
  }

  genres.forEach((_, index) => {
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(
      Math.cos(angleOf(index)) * radius,
      Math.sin(angleOf(index)) * radius,
    );
    ctx.stroke();
  });

  ctx.beginPath();
  genres.forEach(([, count], index) => {
    const r = (count / maxCount) * radius;
    const x = Math.cos(angleOf(index)) * r;
    const y = Math.sin(angleOf(index)) * r;
    if (index === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });
  ctx.closePath();

  ctx.fillStyle = "rgba(0, 240, 255, 0.22)";
  ctx.fill();
  ctx.strokeStyle = NEON;
  ctx.lineWidth = 2;
  ctx.shadowColor = NEON;
  ctx.shadowBlur = 14;
  ctx.stroke();
  ctx.shadowBlur = 0;

  ctx.font = "500 17px Inter, sans-serif";
  ctx.fillStyle = MUTED;
  ctx.textBaseline = "middle";

  genres.forEach(([id], index) => {
    const x = Math.cos(angleOf(index)) * (radius + 26);
    const y = Math.sin(angleOf(index)) * (radius + 26);

    // Подпись слева от центра прижимается вправо и наоборот,
    // иначе длинные слова залезают на фигуру
    ctx.textAlign = x > 6 ? "left" : x < -6 ? "right" : "center";
    ctx.fillText(getGenreName(id), x, y);
  });

  ctx.restore();
}

function drawStats(ctx, profile) {
  const topGenre = profile.genres?.[0]
    ? getGenreName(profile.genres[0][0])
    : "—";

  const era = profile.years
    ? profile.years[0] === profile.years[1]
      ? String(profile.years[0])
      : `${profile.years[0]}–${profile.years[1]}`
    : "—";

  const cells = [
    ["ФИЛЬМОВ", String(profile.total ?? profile.items.length), NEON],
    ["СРЕДНИЙ РЕЙТИНГ", profile.avg ? profile.avg.toFixed(1) : "—", LIME],
    ["ГЛАВНЫЙ ЖАНР", topGenre, MAGENTA],
    ["ЭПОХА", era, TEXT],
  ];

  ctx.textAlign = "left";
  ctx.textBaseline = "alphabetic";

  cells.forEach(([label, value, color], index) => {
    const x = 480 + (index % 2) * 285;
    const y = 1078 + Math.floor(index / 2) * 96;

    ctx.font = "500 17px Inter, sans-serif";
    ctx.fillStyle = MUTED;
    ctx.fillText(label, x, y);

    ctx.font = "700 40px 'Chakra Petch', sans-serif";
    ctx.fillStyle = color;
    glow(ctx, color, 16, () =>
      ctx.fillText(fitText(ctx, value, 260), x, y + 46),
    );
  });
}

/**
 * Длинные названия жанров вроде «Документальный» не влезают в колонку.
 * Canvas сам ничего не обрезает, поэтому считаем ширину вручную
 */
function fitText(ctx, text, maxWidth) {
  if (ctx.measureText(text).width <= maxWidth) return text;

  let result = text;
  while (result.length > 1 && ctx.measureText(`${result}…`).width > maxWidth) {
    result = result.slice(0, -1);
  }

  return `${result}…`;
}

function drawFooter(ctx) {
  ctx.textAlign = "center";

  ctx.font = "500 20px 'Chakra Petch', sans-serif";
  ctx.fillStyle = "rgba(0, 240, 255, 0.75)";
  ctx.fillText("N E O N S C R E E N", 540, 1268);

  ctx.font = "400 17px Inter, sans-serif";
  ctx.fillStyle = MUTED;
  ctx.fillText("unodous.github.io/NeonScreen", 540, 1298);
}
