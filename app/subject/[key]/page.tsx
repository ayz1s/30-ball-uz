import Link from "next/link";
import { getAppConfig } from "@/lib/config";
import { getCurrentUser } from "@/lib/auth";
import { getSubjectDetail } from "@/lib/curriculum";
import { getOpenErrorCount } from "@/lib/quiz";
import { BottomNav } from "@/components/bottom-nav";
import { t, type Locale } from "@/lib/i18n";

export default async function SubjectPage({ params }: { params: Promise<{ key: string }> }) {
  const { key } = await params;
  const { key: appKey } = getAppConfig();
  const user = await getCurrentUser();
  const locale: Locale = user?.languageCode === "ru" ? "ru" : "uz";
  const errorCount = user ? await getOpenErrorCount(user.id) : 0;

  const subject = await getSubjectDetail(appKey, key, user?.id ?? null);

  if (!subject) {
    return (
      <main className="flex min-h-dvh flex-col items-center justify-center px-6 pb-20 text-center">
        <p className="text-sm text-neutral-500 dark:text-neutral-400">{t(locale, "subjectNotFound")}</p>
        <BottomNav locale={locale} errorCount={errorCount} />
      </main>
    );
  }

  const title = locale === "ru" ? subject.title : subject.titleUz;
  const pct = subject.total > 0 ? Math.round((subject.done / subject.total) * 100) : 0;

  return (
    <main className="min-h-dvh px-6 py-8 pb-24">
      <Link href="/" className="text-sm text-blue-600 dark:text-blue-400">
        {t(locale, "navSubjects")}
      </Link>
      <h1 className="mt-2 text-xl font-semibold text-neutral-900 dark:text-neutral-100">{title}</h1>

      <div className="mt-3">
        <div className="flex items-baseline justify-between text-sm text-neutral-600 dark:text-neutral-300">
          <span>
            {subject.done}/{subject.total}
          </span>
        </div>
        <div className="mt-1 h-2 overflow-hidden rounded-full bg-neutral-100 dark:bg-neutral-800">
          <div className="h-full rounded-full bg-blue-600" style={{ width: `${pct}%` }} />
        </div>
      </div>

      <Link
        href={`/subject/${subject.key}/mark-known`}
        className="mt-4 block rounded-xl bg-blue-50 dark:bg-blue-950 px-4 py-3 text-center text-sm font-medium text-blue-700 dark:text-blue-400"
      >
        {t(locale, "markKnownEntry")}
      </Link>

      <div className="mt-6 space-y-2">
        {subject.classes.map((klass) => {
          const classPct = klass.total > 0 ? Math.round((klass.done / klass.total) * 100) : 0;
          return (
            <Link
              key={klass.id}
              href={`/class/${klass.id}`}
              className="block rounded-xl border border-neutral-200 dark:border-neutral-700 p-4"
            >
              <div className="flex items-baseline justify-between">
                <span className="font-medium text-neutral-900 dark:text-neutral-100">{klass.title}</span>
                <span className="text-xs text-neutral-500 dark:text-neutral-400">
                  {klass.done}/{klass.total}
                </span>
              </div>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-neutral-100 dark:bg-neutral-800">
                <div className="h-full rounded-full bg-blue-600" style={{ width: `${classPct}%` }} />
              </div>
            </Link>
          );
        })}
      </div>

      <BottomNav locale={locale} errorCount={errorCount} />
    </main>
  );
}
