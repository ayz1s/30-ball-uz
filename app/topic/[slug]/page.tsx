import { after } from "next/server";
import { db } from "@/lib/db";
import { getAppConfig } from "@/lib/config";
import { getCurrentUser } from "@/lib/auth";
import { getNextTopicSlug } from "@/lib/curriculum";
import { getOpenErrorCount } from "@/lib/quiz";
import { recordTopicOpened } from "@/lib/progress";
import { logEvent } from "@/lib/analytics";
import { TopicScreen } from "@/components/topic-screen";
import type { RawBlock } from "@/components/blocks/registry";
import type { TopicQuestionData } from "@/components/topic-question";
import { t, type Locale } from "@/lib/i18n";

export default async function TopicPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { key: appKey } = getAppConfig();

  const [topic, user] = await Promise.all([
    db.topic.findFirst({
      where: { slug, appKey, published: true },
      include: { questions: { orderBy: { order: "asc" } } },
    }),
    getCurrentUser(),
  ]);

  const locale: Locale = user?.languageCode === "ru" ? "ru" : "uz";

  if (!topic) {
    return (
      <main className="flex min-h-dvh flex-col items-center justify-center px-6 text-center">
        <p className="text-sm text-neutral-500 dark:text-neutral-400">{t(locale, "topicNotFound")}</p>
      </main>
    );
  }

  // Запись "тема открыта" и аналитика — фоновая работа, которая не должна
  // задерживать отдачу страницы. after() досчитывает её уже после ответа,
  // но до того, как Vercel остановит функцию (обычный await здесь заставлял
  // экран темы ждать лишний круг до базы на каждое открытие).
  if (user) {
    after(() =>
      Promise.all([
        recordTopicOpened(user.id, topic.id).catch(() => {}),
        logEvent(appKey, user.id, "topic_opened", { topicId: topic.id, slug: topic.slug }),
      ]),
    );
  }

  const [nextSlug, progress, errorCount] = await Promise.all([
    getNextTopicSlug(appKey, topic.id),
    user
      ? db.progress.findUnique({
          where: { userId_topicId: { userId: user.id, topicId: topic.id } },
          select: { status: true },
        })
      : Promise.resolve(null),
    user ? getOpenErrorCount(user.id) : Promise.resolve(0),
  ]);
  const initialDone = progress?.status === "done" || progress?.status === "known";

  const nextTopic = nextSlug
    ? await db.topic.findUnique({ where: { slug: nextSlug }, select: { slug: true, title: true } })
    : null;

  const questions: TopicQuestionData[] = topic.questions.map((question) => ({
    id: question.id,
    text: question.text,
    options: question.options as string[],
    correctIdx: question.correctIdx,
    explanation: question.explanation,
  }));

  return (
    <TopicScreen
      topicId={topic.id}
      title={topic.title}
      blocks={topic.blocks as RawBlock[]}
      questions={questions}
      locale={locale}
      initialDone={initialDone}
      nextTopic={nextTopic}
      errorCount={errorCount}
    />
  );
}
