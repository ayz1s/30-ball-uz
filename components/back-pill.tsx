import Link from "next/link";

// Кнопка «назад», закреплённая вверху экрана: остаётся на месте при прокрутке.
// inset — горизонтальный отступ страницы (px-5 или px-6), чтобы полоса
// закрепления доходила до краёв экрана.
export function BackPill({ href, label, inset = 5 }: { href: string; label: string; inset?: 5 | 6 }) {
  const bleed = inset === 6 ? "-mx-6 px-6" : "-mx-5 px-5";
  return (
    <div
      className={`sticky top-0 z-30 ${bleed} py-2.5 bg-[#FAF8F5]/95 dark:bg-neutral-950/95 backdrop-blur border-b border-neutral-100 dark:border-neutral-800`}
    >
      <Link
        href={href}
        className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 dark:bg-blue-950 px-3.5 py-2 text-sm font-semibold text-blue-700 dark:text-blue-400"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="M15 5l-7 7 7 7" />
        </svg>
        {label}
      </Link>
    </div>
  );
}
