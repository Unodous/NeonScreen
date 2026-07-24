/**
 * Профиль вкуса упаковывается в адресную строку — так ссылкой можно
 * поделиться, и она откроется у кого угодно без сервера и базы данных.
 *
 * btoa не умеет юникод напрямую, поэтому сначала переводим строку
 * в байты через TextEncoder. Плюс заменяем символы + / = —
 * в URL они имеют собственный смысл (это называют base64url).
 */
export function encodeProfile(profile) {
  const json = JSON.stringify(profile);
  const bytes = new TextEncoder().encode(json);

  let binary = "";
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });

  return btoa(binary)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

export function decodeProfile(encoded) {
  if (!encoded) return null;

  try {
    const base64 = encoded.replace(/-/g, "+").replace(/_/g, "/");
    const binary = atob(base64);
    const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
    const parsed = JSON.parse(new TextDecoder().decode(bytes));

    // Проверяем версию формата: если однажды поменяем структуру,
    // старые ссылки не сломают отрисовку, а просто не откроются
    return parsed?.v === 1 ? parsed : null;
  } catch {
    return null;
  }
}
