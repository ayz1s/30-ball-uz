import Link from "next/link";
import { getAppConfig } from "@/lib/config";
import { getCurrentUser } from "@/lib/auth";
import { getTestsOverview, getOpenErrorCount } from "@/lib/quiz";
import { BottomNav } from "@/components/bottom-nav";
import { t, type Locale } from "@/lib/i18n";

export default async function TestsPage() {
  const { key: appKey } = getAppConfig();
  const user = await getCurrentUser();
  const locale: Locale = user?.languageCode === "ru" ? "ru" : "uz";
  const errorCount = user ? await getOpenErrorCount(user.id) : 0;

  const subjects = await getTestsOverview(appKey);
  const totalQuestions = subjects.reduce((sum, subject) => sum + subject.questionCount, 0);

  return (
    <main className="min-h-dvh px-6 py-8 pb-24">
      <h1 className="text-xl font-semibold text-neutral-900">{t(locale, "navTests")}</h1>

      <Link
        href="/tests/full"
        className={`mt-4 block rounded-xl bg-blue-600 px-4 py-3 text-center text-sm font-medium text-white ${
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
                <h2 className="text-sm font-medium text-neutral-500">{title}</h2>
                {subject.questionCount > 0 && (
                  <Link href={`/tests/subject/${subject.key}`} className="text-xs font-medium text-blue-600">
                    {t(locale, "testsSubjectVariant")}
                  </Link>
                )}
              </div>
              <div className="mt-2 space-y-2">
                {subject.classes.map((klass) => (
                  <Link
                    key={klass.id}
                    href={`/tests/class/${klass.id}`}
                    className={`flex min-h-12 items-center justify-between rounded-xl border border-neutral-200 px-4 py-3 ${
                      klass.questionCount === 0 ? "pointer-events-none opacity-40" : ""
                    }`}
                  >
                    <span className="text-neutral-900">{klass.title}</span>
                    <span className="text-xs text-neutral-500">
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
