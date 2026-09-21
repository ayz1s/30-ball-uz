"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";

// Нативная кнопка «назад» Telegram в шапке мини-приложения: показываем на всех
// экранах, кроме главной, и ведём на предыдущий экран (или на главную, если
// истории нет — например, при открытии темы по прямой ссылке).
export function BackButton() {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const button = window.Telegram?.WebApp?.BackButton;
    if (!button) return;
    if (pathname === "/") {
      button.hide();
      return;
    }
    const goBack = () => {
      if (window.history.length > 1) router.back();
      else router.push("/");
    };
    button.show();
    button.onClick(goBack);
    return () => button.offClick(goBack);
  }, [pathname, router]);

  return null;
}
