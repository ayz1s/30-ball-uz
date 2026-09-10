"use client";

import { useEffect } from "react";

// Тёмная тема ведётся от Telegram (WebApp.colorScheme), а не от ОС —
// пользователь может держать светлую систему, но тёмный Telegram, и наоборот.
// Вне Telegram (обычный браузер) откатываемся на системную настройку.
function applyTheme() {
  const scheme = window.Telegram?.WebApp?.colorScheme;
  const isDark = scheme ? scheme === "dark" : window.matchMedia("(prefers-color-scheme: dark)").matches;
  document.documentElement.classList.toggle("dark", isDark);
}

export function ThemeSync() {
  useEffect(() => {
    applyTheme();

    const tg = window.Telegram?.WebApp;
    tg?.onEvent?.("themeChanged", applyTheme);

    const media = window.matchMedia("(prefers-color-scheme: dark)");
    media.addEventListener("change", applyTheme);

    return () => {
      tg?.offEvent?.("themeChanged", applyTheme);
      media.removeEventListener("change", applyTheme);
    };
  }, []);

  return null;
}
