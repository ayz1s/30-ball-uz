"use client";

// Грубая проверка "мы внутри Telegram", до инициализации SDK — вне
// Telegram (просмотр ссылки в обычном браузере) initData взять неоткуда,
// и мы показываем отдельный экран вместо падения хуков SDK.
export function isTelegramEnvironment(): boolean {
  if (typeof window === "undefined") return false;
  return Boolean(window.Telegram?.WebApp?.initData) || window.location.hash.includes("tgWebAppData");
}
