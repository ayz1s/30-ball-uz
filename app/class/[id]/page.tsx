import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { getClassDetail, type TopicStatus } from "@/lib/curriculum";
import { getOpenErrorCount } from "@/lib/quiz";
import { BottomNav } from "@/components/bottom-nav";
import { BackPill } from "@/components/back-pill";
import { t, type Locale } from "@/lib/i18n";

const STATUS_LABEL_KEY: Record<TopicStatus, "topicStatusNew" | "topicStatusOpened" | "topicStatusDone" | "topicStatusKnown"> = {
  new: "topicStatusNew",
  opened: "topicStatusOpened",
  done: "topicStatusDone",
  known: "topicStatusKnown",
};

const STATUS_DOT: Record<TopicStatus, string> = {
  new: "bg-neutral-300 dark:bg-neutral-600",
  opened: "bg-amber-400",
  done: "bg-green-500",
  known: "bg-blue-500",
};

export default async function ClassPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getCurrentUser();
  const locale: Locale = user?.languageCode === "ru" ? "ru" : "uz";
  const [errorCount, klass] = await Promise.all([
    user ? getOpenErrorCount(user.id) : Promise.resolve(0),
    getClassDetail(id, user?.id ?? null),
  ]);

  if (!klass) {
    return (
      <main className="flex min-h-dvh flex-col items-center justify-center px-6 pb-20 text-center">
        <p className="text-sm text-neutral-500 dark:text-neutral-400">{t(locale, "classNotFound")}</p>
        <BottomNav locale={locale} errorCount={errorCount} />
      </main>
    );
  }

  return (
    <main className="min-h-dvh px-5 py-6 pb-28">
      <BackPill href={`/subject/${klass.subjectKey}`} label={t(locale, "backToSubject")} />
      <h1 className="mt-3 text-2xl font-extrabold tracking-tight text-neutral-900 dark:text-neutral-100">{klass.title}</h1>
      <p className="text-sm text-neutral-500 dark:text-neutral-400">{klass.subjectTitle}</p>

      <div className="mt-6 space-y-5">
        {klass.chapters.map((chapter) => (
          <div key={chapter.id}>
            <h2 className="mb-2 text-sm font-semibold text-neutral-500 dark:text-neutral-400">{chapter.title}</h2>
            <div className="overflow-hidden rounded-2xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900">
              {chapter.topics.map((topic, i) => (
                <Link
                  key={topic.slug}
                  href={`/topic/${topic.slug}`}
                  className={`flex min-h-12 items-center justify-between gap-3 px-4 py-3.5 ${
                    i > 0 ? "border-t border-neutral-100 dark:border-neutral-800" : ""
                  }`}
                >
                  <span className="font-semibold text-neutral-900 dark:text-neutral-100">{topic.title}</span>
                  <span className="flex items-center gap-1.5 text-xs font-medium text-neutral-500 dark:text-neutral-400">
                    <span className={`h-2 w-2 rounded-full ${STATUS_DOT[topic.status]}`} />
                    {t(locale, STATUS_LABEL_KEY[topic.status])}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>

      <BottomNav locale={locale} errorCount={errorCount} />
    </main>
  );
}
