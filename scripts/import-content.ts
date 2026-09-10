// Заливает JSON-файлы из content/seed/ в базу: Subject -> Class -> Chapter -> Topic -> Question.
// Сначала прогоняет ту же проверку, что и validate-content.ts — невалидные файлы не трогают базу.
//   npx tsx scripts/import-content.ts
import "dotenv/config";
import fs from "fs";
import path from "path";
import { PrismaClient, Prisma } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { seedFileSchema, type SeedFile } from "@/content/schema/topic";

const SEED_DIR = path.join(process.cwd(), "content", "seed");

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const db = new PrismaClient({ adapter });

export async function importSeedFile(data: SeedFile) {
  const subject = await db.subject.upsert({
    where: { appKey_key: { appKey: data.appKey, key: data.subject.key } },
    update: { title: data.subject.title, titleUz: data.subject.titleUz, order: data.subject.order },
    create: {
      appKey: data.appKey,
      key: data.subject.key,
      title: data.subject.title,
      titleUz: data.subject.titleUz,
      order: data.subject.order,
    },
  });

  // У Class и Chapter нет уникального ключа в схеме (раздел 5 ТЗ) —
  // ищем по названию внутри родителя, иначе создаём.
  let klass = await db.class.findFirst({ where: { subjectId: subject.id, title: data.class.title } });
  klass = klass
    ? await db.class.update({ where: { id: klass.id }, data: { order: data.class.order } })
    : await db.class.create({ data: { subjectId: subject.id, title: data.class.title, order: data.class.order } });

  let chapter = await db.chapter.findFirst({ where: { classId: klass.id, title: data.chapter.title } });
  chapter = chapter
    ? await db.chapter.update({ where: { id: chapter.id }, data: { order: data.chapter.order } })
    : await db.chapter.create({
        data: { classId: klass.id, title: data.chapter.title, order: data.chapter.order },
      });

  const topic = await db.topic.upsert({
    where: { slug: data.topic.slug },
    update: {
      chapterId: chapter.id,
      appKey: data.appKey,
      title: data.topic.title,
      order: data.topic.order,
      blocks: data.topic.blocks as Prisma.InputJsonValue,
      published: data.topic.published,
    },
    create: {
      chapterId: chapter.id,
      appKey: data.appKey,
      slug: data.topic.slug,
      title: data.topic.title,
      order: data.topic.order,
      blocks: data.topic.blocks as Prisma.InputJsonValue,
      published: data.topic.published,
    },
  });

  // Вопросы у темы пока без стабильного ключа кроме порядка — на этапе
  // тестового контента просто пересобираем набор при каждом импорте.
  await db.question.deleteMany({ where: { topicId: topic.id } });
  if (data.topic.questions.length > 0) {
    await db.question.createMany({
      data: data.topic.questions.map((q) => ({
        topicId: topic.id,
        text: q.text,
        options: q.options,
        correctIdx: q.correctIdx,
        explanation: q.explanation,
        order: q.order,
      })),
    });
  }

  return { subject: subject.key, topic: topic.slug, questions: data.topic.questions.length };
}

async function main() {
  if (!fs.existsSync(SEED_DIR)) {
    console.log(`${SEED_DIR} не найден — нечего импортировать.`);
    return;
  }

  const files = fs.readdirSync(SEED_DIR).filter((name) => name.endsWith(".json"));
  if (files.length === 0) {
    console.log(`В ${SEED_DIR} нет JSON-файлов.`);
    return;
  }

  const imported: string[] = [];
  const failed: Array<{ file: string; errors: string[] }> = [];

  for (const file of files) {
    const fullPath = path.join(SEED_DIR, file);
    let raw: unknown;
    try {
      raw = JSON.parse(fs.readFileSync(fullPath, "utf-8"));
    } catch (error) {
      failed.push({ file, errors: [`Невалидный JSON: ${(error as Error).message}`] });
      continue;
    }

    const result = seedFileSchema.safeParse(raw);
    if (!result.success) {
      failed.push({
        file,
        errors: result.error.issues.map((issue) => `${issue.path.join(".")}: ${issue.message}`),
      });
      continue;
    }

    const summary = await importSeedFile(result.data);
    imported.push(`${file} -> ${summary.subject}/${summary.topic} (${summary.questions} вопросов)`);
  }

  console.log(`Импортировано (${imported.length}):`);
  for (const line of imported) console.log(`  OK ${line}`);

  if (failed.length > 0) {
    console.log(`\nПропущено из-за ошибок (${failed.length}):`);
    for (const item of failed) {
      console.log(`  ОШИБКА ${item.file}`);
      for (const error of item.errors) console.log(`    - ${error}`);
    }
  }

  await db.$disconnect();
  if (failed.length > 0) process.exit(1);
}

if (require.main === module) {
  main().catch(async (error) => {
    console.error(error);
    await db.$disconnect();
    process.exit(1);
  });
}
