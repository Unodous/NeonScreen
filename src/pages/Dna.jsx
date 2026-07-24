import { useEffect, useRef, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useFavorites } from "../context/FavoritesContext.jsx";
import { useTasteProfile } from "../hooks/useTasteProfile.js";
import { drawDna, DNA_WIDTH, DNA_HEIGHT } from "../utils/drawDna.js";
import { encodeProfile, decodeProfile } from "../utils/share.js";
import styles from "./Dna.module.css";

const AUTHOR = "@Unodous";

// Меньше трёх фильмов — спираль выглядит как случайные палки,
// смысла в анализе вкуса тоже нет
const MIN_MOVIES = 3;

function Dna() {
  const canvasRef = useRef(null);
  const [searchParams] = useSearchParams();
  const { favorites } = useFavorites();
  const [status, setStatus] = useState("");

  // Профиль из ссылки разбираем один раз на каждое изменение параметра,
  // а не на каждый рендер
  const sharedProfile = useMemo(
    () => decodeProfile(searchParams.get("p")),
    [searchParams],
  );

  // Если открыли чужую ссылку — свои постеры не анализируем вообще,
  // передаём пустой массив
  const { profile: ownProfile, analyzing } = useTasteProfile(
    sharedProfile ? [] : favorites,
  );

  const profile = sharedProfile ?? ownProfile;
  const enough = Boolean(profile) && profile.items.length >= MIN_MOVIES;

  useEffect(() => {
    if (!enough || !canvasRef.current) return;

    const canvas = canvasRef.current;

    // Ждём загрузки шрифтов: если начать рисовать раньше,
    // canvas молча возьмёт системный шрифт и надписи поедут
    document.fonts.ready.then(() => {
      drawDna(canvas, profile, { author: AUTHOR });
    });
  }, [profile, enough]);

  function handleDownload() {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // toBlob асинхронный и не съедает память так, как toDataURL
    canvas.toBlob((blob) => {
      if (!blob) return;

      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "neonscreen-dna.png";
      link.click();

      // Ссылку на объект нужно освободить вручную, иначе blob
      // останется в памяти до перезагрузки вкладки
      URL.revokeObjectURL(url);
    }, "image/png");
  }

  async function handleShare() {
    if (!profile) return;

    const encoded = encodeProfile(profile);
    const url = `${window.location.origin}${import.meta.env.BASE_URL}dna?p=${encoded}`;

    try {
      await navigator.clipboard.writeText(url);
      setStatus("Ссылка скопирована");
    } catch {
      setStatus("Не удалось скопировать — скопируй адрес вручную");
    }

    setTimeout(() => setStatus(""), 3000);
  }

  return (
    <main className={styles.page}>
      <div className="container">
        <header className={styles.header}>
          <h1 className={styles.title}>Кино-ДНК</h1>
          <p className={styles.subtitle}>
            Каждая перекладина спирали — фильм из избранного, окрашенный в
            доминирующий цвет его постера. Толщина и яркость зависят от
            рейтинга, поворот — от состава подборки.
          </p>

          {sharedProfile && (
            <p className={styles.sharedNote}>
              Ты смотришь чужую ДНК. Чтобы собрать свою — добавь фильмы в
              избранное и открой{" "}
              <Link to="/dna" className={styles.link}>
                эту страницу
              </Link>{" "}
              без ссылки.
            </p>
          )}
        </header>

        {!enough ? (
          <div className={styles.empty}>
            <h2 className={styles.emptyTitle}>
              {analyzing ? "Анализируем постеры…" : "Пока не из чего собирать"}
            </h2>
            <p className={styles.emptyText}>
              {analyzing
                ? "Читаем цвета с обложек, это займёт пару секунд."
                : `Нужно минимум ${MIN_MOVIES} фильма в избранном. Сейчас ${favorites.length}.`}
            </p>
            {!analyzing && (
              <Link to="/" className={styles.button}>
                Выбрать фильмы
              </Link>
            )}
          </div>
        ) : (
          <div className={styles.layout}>
            <div className={styles.canvasWrap}>
              <canvas
                ref={canvasRef}
                className={styles.canvas}
                width={DNA_WIDTH}
                height={DNA_HEIGHT}
                role="img"
                aria-label={`Кино-ДНК: ${profile.total} фильмов, средний рейтинг ${profile.avg}`}
              />
            </div>

            <div className={styles.actions}>
              <button
                type="button"
                className={styles.button}
                onClick={handleDownload}
              >
                Скачать PNG
              </button>
              <button
                type="button"
                className={`${styles.button} ${styles.secondary}`}
                onClick={handleShare}
              >
                Скопировать ссылку
              </button>
            </div>

            <p className={styles.status} role="status">
              {status}
            </p>
          </div>
        )}
      </div>
    </main>
  );
}

export default Dna;
