import { getPosterUrl } from "../../api/tmdb.js";
import styles from "./CastList.module.css";

function CastList({ cast }) {
  // Берём первую дюжину — дальше идут эпизодические роли, они никому не нужны
  const actors = cast?.slice(0, 12) ?? [];

  if (actors.length === 0) return null;

  return (
    <section className={styles.section}>
      <h2 className={styles.heading}>В ролях</h2>

      <ul className={styles.row}>
        {actors.map((person) => {
          const photo = getPosterUrl(person.profile_path, "w185");

          return (
            <li key={person.id} className={styles.item}>
              <div className={styles.photoWrap}>
                {photo ? (
                  <img
                    src={photo}
                    alt={person.name}
                    className={styles.photo}
                    loading="lazy"
                  />
                ) : (
                  <div className={styles.noPhoto}>?</div>
                )}
              </div>

              <p className={styles.name}>{person.name}</p>
              <p className={styles.character}>{person.character}</p>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

export default CastList;
