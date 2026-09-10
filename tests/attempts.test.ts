import "dotenv/config";
import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { recordAttempt } from "@/lib/attempts";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const db = new PrismaClient({ adapter });

const APP_KEY = "vitest-attempts-app";
let userId: string;
let topicId: string;
let questionId: string;

beforeAll(async () => {
  const subject = await db.subject.create({
    data: { appKey: APP_KEY, key: "testsubj", title: "Тест", titleUz: "Test", order: 0 },
  });
  const klass = await db.class.create({ data: { subjectId: subject.id, title: "Класс", order: 0 } });
  const chapter = await db.chapter.create({ data: { classId: klass.id, title: "Глава", order: 0 } });
  const topic = await db.topic.create({
    data: {
      chapterId: chapter.id,
      appKey: APP_KEY,
      slug: "vitest-attempts-topic",
      title: "Тема",
      order: 0,
      blocks: [],
      published: true,
    },
  });
  topicId = topic.id;
  const question = await db.question.create({
    data: {
      topicId: topic.id,
      text: "Вопрос?",
      options: ["А", "Б"],
      correctIdx: 0,
      explanation: "Пояснение",
      order: 0,
    },
  });
  questionId = question.id;
  const user = await db.user.create({
    data: { appKey: APP_KEY, telegramId: BigInt(700000001), firstName: "Тест", languageCode: "ru" },
  });
  userId = user.id;
});

afterAll(async () => {
  await db.attempt.deleteMany({ where: { userId } });
  await db.errorItem.deleteMany({ where: { userId } });
  await db.question.deleteMany({ where: { topicId } });
  await db.topic.deleteMany({ where: { appKey: APP_KEY } });
  await db.chapter.deleteMany({ where: { class: { subject: { appKey: APP_KEY } } } });
  await db.class.deleteMany({ where: { subject: { appKey: APP_KEY } } });
  await db.subject.deleteMany({ where: { appKey: APP_KEY } });
  await db.user.deleteMany({ where: { id: userId } });
  await db.$disconnect();
});

describe("recordAttempt", () => {
  it("возвращает null для несуществующего вопроса", async () => {
    const result = await recordAttempt(userId, "no-such-question", 0, 100);
    expect(result).toBeNull();
  });

  it("неверный ответ создаёт открытую ошибку и попытку", async () => {
    const result = await recordAttempt(userId, questionId, 1, 500);
    expect(result).toEqual({ correct: false });

    const attempt = await db.attempt.findFirst({ where: { userId, questionId }, orderBy: { createdAt: "desc" } });
    expect(attempt?.correct).toBe(false);
    expect(attempt?.chosenIdx).toBe(1);
    expect(attempt?.ms).toBe(500);

    const error = await db.errorItem.findUnique({ where: { userId_questionId: { userId, questionId } } });
    expect(error?.status).toBe("open");
    expect(error?.wrongCount).toBe(1);
  });

  it("повторный неверный ответ увеличивает счётчик ошибки", async () => {
    await recordAttempt(userId, questionId, 1, 300);
    const error = await db.errorItem.findUnique({ where: { userId_questionId: { userId, questionId } } });
    expect(error?.wrongCount).toBe(2);
    expect(error?.status).toBe("open");
  });

  it("верный ответ закрывает открытую ошибку", async () => {
    const result = await recordAttempt(userId, questionId, 0, 200);
    expect(result).toEqual({ correct: true });

    const error = await db.errorItem.findUnique({ where: { userId_questionId: { userId, questionId } } });
    expect(error?.status).toBe("fixed");
    expect(error?.fixedAt).not.toBeNull();
  });
});
