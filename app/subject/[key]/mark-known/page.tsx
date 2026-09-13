import { getAppConfig } from "@/lib/config";
import { getCurrentUser } from "@/lib/auth";
import { getSubjectTopicsFlat } from "@/lib/curriculum";
import { MarkKnownList } from "@/components/mark-known-list";
import { BackPill } from "@/components/back-pill";
import { t, type Locale } from "@/lib/i18n";

export default async function MarkKnownPage({ params }: { params: Promise<{ key: string }> }) {
  const { key } = await params;
  const { key: appKey } = getAppConfig();
  const user = await getCurrentUser();
  const locale: Locale = user?.languageCode === "ru" ? "ru" : "uz";

  const subject = await getSubjectTopicsFlat(appKey, key, user?.id ?? null);

  if (!subject) {
    return (
      <main className="flex min-h-dvh flex-col items-center justify-center px-6 text-center">
        <p className="text-sm text-neutral-500 dark:text-neutral-400">{t(locale, "subjectNotFound")}</p>
      </main>
    );
  }

  return (
    <main className="min-h-dvh px-6 py-8">
      <BackPill href={`/subject/${subject.key}`} label={t(locale, "backToSubject")} />
      <h1 className="mt-3 mb-4 text-xl font-semibold text-neutral-900 dark:text-neutral-100">{t(locale, "markKnownTitle")}</h1>
      <MarkKnownList topics={subject.topics} locale={locale} />
    </main>
  );
}
