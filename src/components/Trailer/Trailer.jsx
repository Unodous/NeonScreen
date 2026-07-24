import styles from "./Trailer.module.css";

function Trailer({ videos }) {
  // TMDB отдаёт вперемешку тизеры, вырезанные сцены, интервью.
  // Нужен именно трейлер с YouTube, приоритет — русской озвучке
  const trailer =
    videos?.find(
      (v) =>
        v.site === "YouTube" && v.type === "Trailer" && v.iso_639_1 === "ru",
    ) ??
    videos?.find((v) => v.site === "YouTube" && v.type === "Trailer") ??
    videos?.find((v) => v.site === "YouTube");

  if (!trailer) return null;

  return (
    <section className={styles.section}>
      <h2 className={styles.heading}>Трейлер</h2>

      <div className={styles.frame}>
        <iframe
          src={`https://www.youtube.com/embed/${trailer.key}`}
          title={trailer.name}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; picture-in-picture"
          allowFullScreen
          loading="lazy"
        />
      </div>
    </section>
  );
}

export default Trailer;
