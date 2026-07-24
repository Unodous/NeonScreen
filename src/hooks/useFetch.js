import { useState, useEffect } from "react";

/**
 * Любая загрузка данных — это три состояния: грузим, получили, упало.
 * Хук инкапсулирует эту рутину, чтобы не копировать её в каждом компоненте.
 *
 * @param fetcher — функция, возвращающая промис
 * @param deps — при изменении чего перезапрашивать
 */
export function useFetch(fetcher, deps = []) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Флаг защищает от гонки: если компонент размонтировали или
    // параметры сменились раньше ответа — результат уже не нужен
    let ignore = false;

    setLoading(true);
    setError(null);

    fetcher()
      .then((result) => {
        if (!ignore) setData(result);
      })
      .catch((err) => {
        if (!ignore) setError(err.message);
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });

    return () => {
      ignore = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return { data, loading, error };
}
