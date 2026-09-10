import { db } from "@/lib/db";

export interface QuizQuestion {
  id: string;
  text: string;
  options: string[];
  correctIdx: number;
  explanation: string;
}

interface QuestionRow {
  id: string;
  text: string;
  options: unknown;
  correctIdx: number;
  explanation: string;
}

function toQuizQuestions(rows: QuestionRow[]): QuizQuestion[] {
  return rows.map((q) => ({
    id: q.id,
    text: q.text,
    options: q.options as string[],
    correctIdx: q.correctIdx,
    explanation: q.explanation,
  }));
}

export async function getClassQuestions(classId: string) {
  const klass = await db.class.findUnique({
    where: { id: classId },
    include: {
      subject: true,
      chapters: { include: { topics: { where: { published: true }, include: { questions: true } } } },
    },
  });
  if (!klass) return null;

  const questions = klass.chapters.flatMap((chapter) => chapter.topics.flatMap((topic) => topic.questions));
  return { title: klass.title, questions: toQuizQuestions(questions) };
}

export async function getSubjectQuestions(appKey: string, subjectKey: string) {
  const subject = await db.subject.findUnique({
    where: { appKey_key: { appKey, key: subjectKey } },
    include: {
      classes: {
        include: { chapters: { include: { topics: { where: { published: true }, include: { questions: true } } } } },
      },
    },
  });
  if (!subject) return null;

  const questions = subject.classes.flatMap((klass) =>
    klass.chapters.flatMap((chapter) => chapter.topics.flatMap((topic) => topic.questions)),
  );
  return { title: subject.title, questions: toQuizQuestions(questions) };
}

export async function getAllQuestions(appKey: string) {
  const topics = await db.topic.findMany({
    where: { appKey, published: true },
    include: { questions: true },
  });
  return toQuizQuestions(topics.flatMap((topic) => topic.questions));
}

export async function getTestsOverview(appKey: string) {
  const subjects = await db.subject.findMany({
    where: { appKey },
    orderBy: { order: "asc" },
    include: {
      classes: {
        orderBy: { order: "asc" },
        include: {
          chapters: {
            include: { topics: { where: { published: true }, include: { questions: { select: { id: true } } } } },
          },
        },
      },
    },
  });

  return subjects.map((subject) => {
    const classes = subject.classes.map((klass) => ({
      id: klass.id,
      title: klass.title,
      questionCount: klass.chapters.reduce(
        (sum, chapter) => sum + chapter.topics.reduce((s, topic) => s + topic.questions.length, 0),
        0,
      ),
    }));
    return {
      key: subject.key,
      title: subject.title,
      titleUz: subject.titleUz,
      classes,
      questionCount: classes.reduce((sum, klass) => sum + klass.questionCount, 0),
    };
  });
}

export async function getOpenErrorCount(userId: string) {
  return db.errorItem.count({ where: { userId, status: "open" } });
}

export interface ErrorEntry {
  question: QuizQuestion;
  wrongCount: number;
}

export async function getErrorsOverview(userId: string) {
  const errors = await db.errorItem.findMany({
    where: { userId },
    include: { question: true },
    orderBy: { createdAt: "desc" },
  });

  const toEntry = (item: (typeof errors)[number]): ErrorEntry => ({
    question: toQuizQuestions([item.question])[0],
    wrongCount: item.wrongCount,
  });

  return {
    open: errors.filter((item) => item.status === "open").map(toEntry),
    fixed: errors.filter((item) => item.status === "fixed").map(toEntry),
  };
}

export interface ReviewEntry {
  slug: string;
  title: string;
  at: Date;
}

export async function getReviewList(userId: string): Promise<ReviewEntry[]> {
  const items = await db.progress.findMany({
    where: { userId, status: { in: ["done", "known"] } },
    include: { topic: { select: { slug: true, title: true } } },
    orderBy: [{ doneAt: "asc" }, { seenAt: "asc" }],
  });

  return items.map((item) => ({
    slug: item.topic.slug,
    title: item.topic.title,
    at: item.doneAt ?? item.seenAt,
  }));
}
