import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { getReviewList, getOpenErrorCount } from "@/lib/quiz";
import { BottomNav } from "@/components/bottom-nav";
import { t, type Locale } from "@/lib/i18n";

function daysAgo(date: Date): number {
  return Math.max(0, Math.floor((Date.now() - date.getTime()) / (24 * 60 * 60 * 1000)));
}

export default async function ReviewPage() {
  const user = await getCurrentUser();
  const locale: Locale = user?.languageCode === "ru" ? "ru" : "uz";
  const [items, errorCount] = await Promise.all([
    user ? getReviewList(user.id) : Promise.resolve([]),
    user ? getOpenErrorCount(user.id) : Promise.resolve(0),
  ]);

  return (
    <main className="min-h-dvh px-5 py-6 pb-28">
      <h1 className="mb-4 text-2xl font-extrabold tracking-tight text-neutral-900 dark:text-neutral-100">{t(locale, "navReview")}</h1>

      {items.length === 0 ? (
        <p className="px-2 py-8 text-center text-sm text-neutral-500 dark:text-neutral-400">{t(locale, "reviewEmpty")}</p>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900">
          {items.map((item, i) => (
            <Link
              key={item.slug}
              href={`/topic/${item.slug}`}
              className={`flex min-h-12 items-center justify-between gap-3 px-4 py-3.5 ${
                i > 0 ? "border-t border-neutral-100 dark:border-neutral-800" : ""
              }`}
            >
              <span className="font-semibold text-neutral-900 dark:text-neutral-100">{item.title}</span>
              <span className="text-xs text-neutral-500 dark:text-neutral-400">
                {t(locale, "reviewDaysAgo", { days: String(daysAgo(item.at)) })}
              </span>
            </Link>
          ))}
        </div>
      )}

      <BottomNav locale={locale} errorCount={errorCount} />
    </main>
  );
}
