"use client";

// Грубая проверка "мы внутри Telegram", до инициализации SDK — вне
// Telegram (просмотр ссылки в обычном браузере) initData взять неоткуда,
// и мы показываем отдельный экран вместо падения хуков SDK.
export function isTelegramEnvironment(): boolean {
  if (typeof window === "undefined") return false;
  return Boolean(window.Telegram?.WebApp?.initData) || window.location.hash.includes("tgWebAppData");
}

// window.Telegram.WebApp.initData ставит официальный скрипт
// telegram-web-app.js, но на некоторых клиентах он не успевает — на этот
// случай достаём initData прямо из hash ссылки, куда Telegram кладёт его
// при запуске мини-аппа (raw.tgWebAppData уже в нужном для сервера виде).
export function getRawInitData(): string | undefined {
  if (typeof window === "undefined") return undefined;

  const fromScript = window.Telegram?.WebApp?.initData;
  if (fromScript) return fromScript;

  const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ""));
  const fromHash = hashParams.get("tgWebAppData");
  return fromHash || undefined;
}
