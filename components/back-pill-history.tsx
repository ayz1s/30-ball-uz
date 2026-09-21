"use client";

import { useRouter } from "next/navigation";

// Видимая кнопка «назад» внутри страницы: возвращает на предыдущий экран
// (или на главную, если истории нет). Работает и там, где нативная кнопка
// Telegram недоступна.
export function BackPillHistory({ label }: { label: string }) {
  const router = useRouter();
  return (
    <button
      type="button"
      onClick={() => (window.history.length > 1 ? router.back() : router.push("/"))}
      className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 dark:bg-blue-950 px-3.5 py-2 text-sm font-semibold text-blue-700 dark:text-blue-400"
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="M15 5l-7 7 7 7" />
      </svg>
      {label}
    </button>
  );
}
