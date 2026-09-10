import { db } from "@/lib/db";
import { getAppConfig } from "@/lib/config";
import { getCurrentUser } from "@/lib/auth";
import { getNextTopicSlug } from "@/lib/curriculum";
import { getOpenErrorCount } from "@/lib/quiz";
import { recordTopicOpened } from "@/lib/progress";
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
        <p className="text-sm text-neutral-500">{t(locale, "topicNotFound")}</p>
      </main>
    );
  }

  let initialDone = false;
  if (user) {
    await recordTopicOpened(user.id, topic.id);
    const progress = await db.progress.findUnique({
      where: { userId_topicId: { userId: user.id, topicId: topic.id } },
      select: { status: true },
    });
    initialDone = progress?.status === "done" || progress?.status === "known";
  }

  const nextSlug = await getNextTopicSlug(appKey, topic.id);
  const [nextTopic, errorCount] = await Promise.all([
    nextSlug ? db.topic.findUnique({ where: { slug: nextSlug }, select: { slug: true, title: true } }) : null,
    user ? getOpenErrorCount(user.id) : 0,
  ]);

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
