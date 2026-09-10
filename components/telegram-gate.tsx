"use client";

import { useSyncExternalStore } from "react";
import { isTelegramEnvironment } from "@/lib/telegram-env";
import { HomeScreen } from "@/components/home-screen";
import { OpenInTelegram } from "@/components/open-in-telegram";

// Значение известно только в браузере (SSR всегда рендерит "checking"), а
// после гидратации меняться не может — сравнивать/пересчитывать нечего,
// поэтому subscribe ничего не делает.
function subscribe() {
  return () => {};
}

function getSnapshot(): "telegram" | "browser" {
  return isTelegramEnvironment() ? "telegram" : "browser";
}

function getServerSnapshot(): "checking" {
  return "checking";
}

export function TelegramGate() {
  const environment = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  if (environment === "checking") return null;
  if (environment === "browser") return <OpenInTelegram />;
  return <HomeScreen />;
}
