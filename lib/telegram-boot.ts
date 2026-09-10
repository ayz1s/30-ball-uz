"use client";

import { init } from "@telegram-apps/sdk-react";
import { isTelegramEnvironment } from "@/lib/telegram-env";

let started = false;

// Вызывается один раз на уровне модуля (см. components/home-screen.tsx),
// до того как компонент впервые вызовет useRawInitData — SDK должен успеть
// проинициализироваться синхронно, иначе первый рендер прочитает пустые данные.
export function ensureTelegramSdkInit() {
  if (started || typeof window === "undefined" || !isTelegramEnvironment()) return;
  started = true;
  init();
}
