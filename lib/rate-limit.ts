// Простой лимитер на память процесса — для одного эндпоинта на старте
// (раздел 8.4 ТЗ). У serverless-функций Vercel нет общей памяти между
// инстансами, поэтому это не точный глобальный лимит, а грубая защита от
// шквала запросов с одного тёплого инстанса. Когда публичных эндпоинтов
// станет больше (этап 4 — попытки прохождения теста), нужен общий счётчик
// (например, Upstash Redis) — это отдельная зависимость, заводить её сейчас
// под один эндпоинт избыточно.
const hits = new Map<string, number[]>();

export function isRateLimited(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const timestamps = (hits.get(key) ?? []).filter((t) => now - t < windowMs);
  timestamps.push(now);
  hits.set(key, timestamps);
  return timestamps.length > limit;
}
