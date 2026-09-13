import Link from "next/link";
import { getAppConfig } from "@/lib/config";
import { getCurrentUser } from "@/lib/auth";
import { getSubjectDetail } from "@/lib/curriculum";
import { getOpenErrorCount } from "@/lib/quiz";
import { BottomNav } from "@/components/bottom-nav";
import { BackPill } from "@/components/back-pill";
import { RingStat } from "@/components/ring-progress";
import { t, type Locale } from "@/lib/i18n";

export default async function SubjectPage({ params }: { params: Promise<{ key: string }> }) {
  const { key } = await params;
  const { key: appKey } = getAppConfig();
  const user = await getCurrentUser();
  const locale: Locale = user?.languageCode === "ru" ? "ru" : "uz";
  const [errorCount, subject] = await Promise.all([
    user ? getOpenErrorCount(user.id) : Promise.resolve(0),
    getSubjectDetail(appKey, key, user?.id ?? null),
  ]);

  if (!subject) {
    return (
      <main className="flex min-h-dvh flex-col items-center justify-center px-6 pb-20 text-center">
        <p className="text-sm text-neutral-500 dark:text-neutral-400">{t(locale, "subjectNotFound")}</p>
        <BottomNav locale={locale} errorCount={errorCount} />
      </main>
    );
  }

  const title = locale === "ru" ? subject.title : subject.titleUz;

  return (
    <main className="min-h-dvh px-5 py-6 pb-28">
      <BackPill href="/" label={t(locale, "navSubjects")} />
      <h1 className="mt-3 text-2xl font-extrabold tracking-tight text-neutral-900 dark:text-neutral-100">{title}</h1>

      <div className="mt-4 flex items-center gap-3 rounded-2xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 p-4">
        <RingStat value={subject.done} total={subject.total} size={52} />
        <p className="flex-1 text-sm font-semibold text-neutral-800 dark:text-neutral-200">
          {t(locale, "topicsDoneOfTotal", { done: String(subject.done), total: String(subject.total) })}
        </p>
      </div>

      <Link
        href={`/subject/${subject.key}/mark-known`}
        className="mt-4 block rounded-2xl border-[1.5px] border-blue-600 dark:border-blue-400 px-4 py-3 text-center text-sm font-bold text-blue-700 dark:text-blue-400"
      >
        {t(locale, "markKnownEntry")}
      </Link>

      <div className="mt-6 overflow-hidden rounded-2xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900">
        {subject.classes.map((klass, i) => (
          <Link
            key={klass.id}
            href={`/class/${klass.id}`}
            className={`flex items-center gap-3 px-4 py-3.5 ${
              i > 0 ? "border-t border-neutral-100 dark:border-neutral-800" : ""
            }`}
          >
            <span className="flex-1 font-semibold text-neutral-900 dark:text-neutral-100">{klass.title}</span>
            <RingStat value={klass.done} total={klass.total} size={40} />
          </Link>
        ))}
      </div>

      <BottomNav locale={locale} errorCount={errorCount} />
    </main>
  );
}
