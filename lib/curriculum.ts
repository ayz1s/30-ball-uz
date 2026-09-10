import { db } from "@/lib/db";
import { cached } from "@/lib/cache";

const CONTENT_TTL_MS = 60_000;

export type TopicStatus = "new" | "opened" | "done" | "known";

export interface HomeSubjectSummary {
  key: string;
  title: string;
  titleUz: string;
  total: number;
  done: number;
}

// Структура предметов/тем меняется только через content:import — кэшируем
// её отдельно от прогресса пользователя, который всегда читаем свежим
// (раздел 9 ТЗ: контент кэшируется, персональные данные — нет).
async function getHomeStructure(appKey: string) {
  return cached(`home-structure:${appKey}`, CONTENT_TTL_MS, () =>
    db.subject.findMany({
      where: { appKey },
      orderBy: { order: "asc" },
      include: {
        classes: {
          include: {
            chapters: {
              include: { topics: { where: { published: true }, select: { id: true } } },
            },
          },
        },
      },
    }),
  );
}

export async function getHomeSummary(appKey: string, userId: string | null) {
  const subjects = await getHomeStructure(appKey);

  const topicToSubjectKey = new Map<string, string>();
  for (const subject of subjects) {
    for (const klass of subject.classes) {
      for (const chapter of klass.chapters) {
        for (const topic of chapter.topics) {
          topicToSubjectKey.set(topic.id, subject.key);
        }
      }
    }
  }

  const doneBySubject = new Map<string, number>();
  if (userId && topicToSubjectKey.size > 0) {
    const progress = await db.progress.findMany({
      where: { userId, topicId: { in: [...topicToSubjectKey.keys()] }, status: { in: ["done", "known"] } },
      select: { topicId: true },
    });
    for (const item of progress) {
      const key = topicToSubjectKey.get(item.topicId);
      if (key) doneBySubject.set(key, (doneBySubject.get(key) ?? 0) + 1);
    }
  }

  const subjectSummaries: HomeSubjectSummary[] = subjects.map((subject) => {
    const total = subject.classes.reduce(
      (sum, klass) => sum + klass.chapters.reduce((s, chapter) => s + chapter.topics.length, 0),
      0,
    );
    return {
      key: subject.key,
      title: subject.title,
      titleUz: subject.titleUz,
      total,
      done: doneBySubject.get(subject.key) ?? 0,
    };
  });

  return {
    subjects: subjectSummaries,
    doneTotal: subjectSummaries.reduce((sum, item) => sum + item.done, 0),
    totalTopics: subjectSummaries.reduce((sum, item) => sum + item.total, 0),
  };
}

async function getSubjectStructure(appKey: string, subjectKey: string) {
  return cached(`subject-structure:${appKey}:${subjectKey}`, CONTENT_TTL_MS, () =>
    db.subject.findUnique({
      where: { appKey_key: { appKey, key: subjectKey } },
      include: {
        classes: {
          orderBy: { order: "asc" },
          include: {
            chapters: {
              orderBy: { order: "asc" },
              include: { topics: { where: { published: true }, select: { id: true } } },
            },
          },
        },
      },
    }),
  );
}

export async function getSubjectDetail(appKey: string, subjectKey: string, userId: string | null) {
  const subject = await getSubjectStructure(appKey, subjectKey);
  if (!subject) return null;

  const allTopicIds = subject.classes.flatMap((klass) =>
    klass.chapters.flatMap((chapter) => chapter.topics.map((topic) => topic.id)),
  );

  const doneIds = new Set<string>();
  if (userId && allTopicIds.length > 0) {
    const progress = await db.progress.findMany({
      where: { userId, topicId: { in: allTopicIds }, status: { in: ["done", "known"] } },
      select: { topicId: true },
    });
    for (const item of progress) doneIds.add(item.topicId);
  }

  const classes = subject.classes.map((klass) => {
    const topicIds = klass.chapters.flatMap((chapter) => chapter.topics.map((topic) => topic.id));
    return {
      id: klass.id,
      title: klass.title,
      total: topicIds.length,
      done: topicIds.filter((id) => doneIds.has(id)).length,
    };
  });

  return {
    key: subject.key,
    title: subject.title,
    titleUz: subject.titleUz,
    classes,
    total: allTopicIds.length,
    done: doneIds.size,
  };
}

async function getClassStructure(classId: string) {
  return cached(`class-structure:${classId}`, CONTENT_TTL_MS, () =>
    db.class.findUnique({
      where: { id: classId },
      include: {
        subject: true,
        chapters: {
          orderBy: { order: "asc" },
          include: { topics: { where: { published: true }, orderBy: { order: "asc" } } },
        },
      },
    }),
  );
}

export async function getClassDetail(classId: string, userId: string | null) {
  const klass = await getClassStructure(classId);
  if (!klass) return null;

  const topicIds = klass.chapters.flatMap((chapter) => chapter.topics.map((topic) => topic.id));
  const statusById = new Map<string, TopicStatus>();
  if (userId && topicIds.length > 0) {
    const progress = await db.progress.findMany({
      where: { userId, topicId: { in: topicIds } },
      select: { topicId: true, status: true },
    });
    for (const item of progress) statusById.set(item.topicId, item.status as TopicStatus);
  }

  return {
    id: klass.id,
    title: klass.title,
    subjectKey: klass.subject.key,
    subjectTitle: klass.subject.title,
    chapters: klass.chapters.map((chapter) => ({
      id: chapter.id,
      title: chapter.title,
      topics: chapter.topics.map((topic) => ({
        slug: topic.slug,
        title: topic.title,
        status: statusById.get(topic.id) ?? ("new" as TopicStatus),
      })),
    })),
  };
}

async function getSubjectTopicsStructure(appKey: string, subjectKey: string) {
  return cached(`subject-topics-structure:${appKey}:${subjectKey}`, CONTENT_TTL_MS, () =>
    db.subject.findUnique({
      where: { appKey_key: { appKey, key: subjectKey } },
      include: {
        classes: {
          orderBy: { order: "asc" },
          include: {
            chapters: {
              orderBy: { order: "asc" },
              include: { topics: { where: { published: true }, orderBy: { order: "asc" } } },
            },
          },
        },
      },
    }),
  );
}

export async function getSubjectTopicsFlat(appKey: string, subjectKey: string, userId: string | null) {
  const subject = await getSubjectTopicsStructure(appKey, subjectKey);
  if (!subject) return null;

  const topics = subject.classes.flatMap((klass) =>
    klass.chapters.flatMap((chapter) =>
      chapter.topics.map((topic) => ({
        id: topic.id,
        slug: topic.slug,
        title: topic.title,
        classTitle: klass.title,
        chapterTitle: chapter.title,
      })),
    ),
  );

  const knownIds = new Set<string>();
  if (userId && topics.length > 0) {
    const progress = await db.progress.findMany({
      where: { userId, topicId: { in: topics.map((topic) => topic.id) }, status: "known" },
      select: { topicId: true },
    });
    for (const item of progress) knownIds.add(item.topicId);
  }

  return {
    key: subject.key,
    title: subject.title,
    topics: topics.map((topic) => ({ ...topic, known: knownIds.has(topic.id) })),
  };
}

// appKey ограничивает выборку темами текущего приложения (раздел 2 ТЗ) —
// порядок глобальный: предмет -> класс -> глава -> тема, все по полю order.
export async function getNextTopicSlug(appKey: string, currentTopicId: string): Promise<string | null> {
  const topics = await cached(`topic-order:${appKey}`, CONTENT_TTL_MS, () =>
    db.topic.findMany({
      where: { appKey, published: true },
      orderBy: [
        { chapter: { class: { subject: { order: "asc" } } } },
        { chapter: { class: { order: "asc" } } },
        { chapter: { order: "asc" } },
        { order: "asc" },
      ],
      select: { id: true, slug: true },
    }),
  );

  const index = topics.findIndex((topic) => topic.id === currentTopicId);
  if (index === -1 || index === topics.length - 1) return null;
  return topics[index + 1].slug;
}
