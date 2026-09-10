// Простой in-memory кэш с TTL для запросов контента, который меняется редко
// (раздел 9 ТЗ). Не годится для персонализированных данных (прогресс
// пользователя) — только для структуры/содержимого, одинакового для всех.
const store = new Map<string, { value: Promise<unknown>; expires: number }>();

export function cached<T>(key: string, ttlMs: number, fn: () => Promise<T>): Promise<T> {
  const hit = store.get(key);
  if (hit && hit.expires > Date.now()) {
    return hit.value as Promise<T>;
  }

  const promise = fn().catch((error) => {
    store.delete(key);
    throw error;
  });
  store.set(key, { value: promise, expires: Date.now() + ttlMs });
  return promise;
}
