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

export function BottomNav({ locale }: { locale: Locale }) {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 flex border-t border-neutral-200 bg-white pb-[env(safe-area-inset-bottom)]">
      {ITEMS.map((item) => {
        const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex min-h-14 flex-1 flex-col items-center justify-center gap-0.5 text-xs font-medium ${
              active ? "text-blue-700" : "text-neutral-500"
            }`}
          >
            <span className="text-lg leading-none">{item.icon}</span>
            {t(locale, item.labelKey)}
          </Link>
        );
      })}
    </nav>
  );
}
