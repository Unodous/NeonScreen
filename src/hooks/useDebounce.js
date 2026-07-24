import { useState, useEffect } from "react";

/**
 * Возвращает значение с задержкой: обновляется только после того,
 * как пользователь перестал печатать на указанное время.
 *
 * Без этого запрос уходил бы на каждую нажатую клавишу — при слове
 * из 10 букв это 10 запросов вместо одного.
 */
export function useDebounce(value, delay = 500) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);

    // Каждое новое нажатие отменяет предыдущий таймер — так срабатывает
    // только последний, когда набор действительно закончился
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}
