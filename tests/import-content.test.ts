import "dotenv/config";
import { describe, it, expect, afterAll } from "vitest";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { importSeedFile } from "@/scripts/import-content";
import { seedFileSchema } from "@/content/schema/topic";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const db = new PrismaClient({ adapter });

const TEST_APP_KEY = "vitest-tmp-app";

const seed = seedFileSchema.parse({
  appKey: TEST_APP_KEY,
  subject: { key: "testsubj", title: "Тестовый предмет", titleUz: "Test fan", order: 0 },
  class: { title: "Тестовый класс", order: 0 },
  chapter: { title: "Тестовая глава", order: 0 },
  topic: {
    slug: "vitest-tmp-topic",
    title: "Тестовая тема",
    order: 0,
    published: true,
    blocks: [{ type: "text", paragraphs: [[{ text: "тест" }]] }],
    questions: [{ text: "Вопрос?", options: ["А", "Б"], correctIdx: 0, explanation: "Пояснение", order: 0 }],
  },
});

afterAll(async () => {
  await db.question.deleteMany({ where: { topic: { slug: seed.topic.slug } } });
  await db.topic.deleteMany({ where: { slug: seed.topic.slug } });
  await db.chapter.deleteMany({ where: { class: { subject: { appKey: TEST_APP_KEY } } } });
  await db.class.deleteMany({ where: { subject: { appKey: TEST_APP_KEY } } });
  await db.subject.deleteMany({ where: { appKey: TEST_APP_KEY } });
  await db.$disconnect();
});

describe("importSeedFile", () => {
  it("создаёт Subject/Class/Chapter/Topic/Question по цепочке из файла", async () => {
    const result = await importSeedFile(seed);
    expect(result).toEqual({ subject: "testsubj", topic: "vitest-tmp-topic", questions: 1 });

    const topic = await db.topic.findUnique({ where: { slug: seed.topic.slug }, include: { questions: true } });
    expect(topic?.published).toBe(true);
    expect(topic?.questions).toHaveLength(1);
    expect(topic?.questions[0].text).toBe("Вопрос?");
  });

  it("повторный импорт того же файла не создаёт дублей (идемпотентность)", async () => {
    await importSeedFile(seed);
    await importSeedFile(seed);

    const subjects = await db.subject.findMany({ where: { appKey: TEST_APP_KEY } });
    const classes = await db.class.findMany({ where: { subject: { appKey: TEST_APP_KEY } } });
    const topics = await db.topic.findMany({ where: { slug: seed.topic.slug } });
    expect(subjects).toHaveLength(1);
    expect(classes).toHaveLength(1);
    expect(topics).toHaveLength(1);
  });
});
