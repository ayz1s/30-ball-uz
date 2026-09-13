import Link from "next/link";
import { getAppConfig } from "@/lib/config";
import { getCurrentUser } from "@/lib/auth";
import { getTestsOverview, getOpenErrorCount } from "@/lib/quiz";
import { BottomNav } from "@/components/bottom-nav";
import { t, type Locale } from "@/lib/i18n";

export default async function TestsPage() {
  const { key: appKey } = getAppConfig();
  const [user, subjects] = await Promise.all([getCurrentUser(), getTestsOverview(appKey)]);
  const locale: Locale = user?.languageCode === "ru" ? "ru" : "uz";
  const errorCount = user ? await getOpenErrorCount(user.id) : 0;
  const totalQuestions = subjects.reduce((sum, subject) => sum + subject.questionCount, 0);

  return (
    <main className="min-h-dvh px-5 py-6 pb-28">
      <h1 className="text-2xl font-extrabold tracking-tight text-neutral-900 dark:text-neutral-100">{t(locale, "navTests")}</h1>

      <Link
        href="/tests/full"
        className={`mt-4 block rounded-2xl bg-blue-600 px-4 py-3 text-center text-sm font-bold text-white ${
          totalQuestions === 0 ? "pointer-events-none opacity-40" : ""
        }`}
      >
        {t(locale, "testsFullVariant", { count: String(totalQuestions) })}
      </Link>

      <div className="mt-6 space-y-5">
        {subjects.map((subject) => {
          const title = locale === "ru" ? subject.title : subject.titleUz;
          return (
            <div key={subject.key}>
              <div className="flex items-baseline justify-between">
                <h2 className="text-sm font-semibold text-neutral-500 dark:text-neutral-400">{title}</h2>
                {subject.questionCount > 0 && (
                  <Link
                    href={`/tests/subject/${subject.key}`}
                    className="rounded-full bg-blue-50 dark:bg-blue-950 px-3 py-1.5 text-xs font-bold text-blue-700 dark:text-blue-400"
                  >
                    {t(locale, "testsSubjectVariant")}
                  </Link>
                )}
              </div>
              <div className="mt-2 overflow-hidden rounded-2xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900">
                {subject.classes.map((klass, i) => (
                  <Link
                    key={klass.id}
                    href={`/tests/class/${klass.id}`}
                    className={`flex min-h-12 items-center justify-between px-4 py-3.5 ${
                      klass.questionCount === 0 ? "pointer-events-none opacity-40" : ""
                    } ${i > 0 ? "border-t border-neutral-100 dark:border-neutral-800" : ""}`}
                  >
                    <span className="font-semibold text-neutral-900 dark:text-neutral-100">{klass.title}</span>
                    <span className="text-xs text-neutral-500 dark:text-neutral-400">
                      {t(locale, "testsQuestionCount", { count: String(klass.questionCount) })}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <BottomNav locale={locale} errorCount={errorCount} />
    </main>
  );
}
