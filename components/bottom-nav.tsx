"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { t, type Locale } from "@/lib/i18n";

const ITEMS = [
  { href: "/", labelKey: "navSubjects" as const },
  { href: "/tests", labelKey: "navTests" as const },
  { href: "/errors", labelKey: "navErrors" as const },
  { href: "/review", labelKey: "navReviewShort" as const },
];

export function BottomNav({ locale, errorCount = 0 }: { locale: Locale; errorCount?: number }) {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 border-t border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-3 pb-[calc(env(safe-area-inset-bottom)+10px)] pt-2.5">
      <div className="mx-auto flex max-w-md gap-1 rounded-2xl bg-neutral-100 dark:bg-neutral-800 p-1">
        {ITEMS.map((item) => {
          const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`relative flex-1 rounded-xl py-2.5 text-center text-[13px] font-bold ${
                active
                  ? "bg-white dark:bg-neutral-700 text-blue-700 dark:text-blue-400 shadow-sm"
                  : "text-neutral-500 dark:text-neutral-400"
              }`}
            >
              {t(locale, item.labelKey)}
              {item.href === "/errors" && errorCount > 0 && (
                <span className="absolute right-3 top-1.5 h-1.5 w-1.5 rounded-full bg-red-600" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
