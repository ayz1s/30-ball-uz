"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { t, type Locale } from "@/lib/i18n";

const ITEMS = [
  { href: "/", labelKey: "navSubjects" as const, icon: "📚" },
  { href: "/tests", labelKey: "navTests" as const, icon: "📝" },
  { href: "/errors", labelKey: "navErrors" as const, icon: "⚠️" },
  { href: "/review", labelKey: "navReview" as const, icon: "🔁" },
];

export function BottomNav({ locale, errorCount = 0 }: { locale: Locale; errorCount?: number }) {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 flex border-t border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 pb-[env(safe-area-inset-bottom)]">
      {ITEMS.map((item) => {
        const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`relative flex min-h-14 flex-1 flex-col items-center justify-center gap-0.5 text-xs font-medium ${
              active ? "text-blue-700 dark:text-blue-400" : "text-neutral-500 dark:text-neutral-400"
            }`}
          >
            <span className="relative text-lg leading-none">
              {item.icon}
              {item.href === "/errors" && errorCount > 0 && (
                <span className="absolute -right-2 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-semibold text-white">
                  {errorCount > 99 ? "99+" : errorCount}
                </span>
              )}
            </span>
            {t(locale, item.labelKey)}
          </Link>
        );
      })}
    </nav>
  );
}
