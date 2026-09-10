import { db } from "@/lib/db";

// Не понижает статус, если запись уже есть (например, тема уже "known") —
// открытие темы не должно затирать более высокий прогресс.
export async function recordTopicOpened(userId: string, topicId: string) {
  await db.progress.upsert({
    where: { userId_topicId: { userId, topicId } },
    update: {},
    create: { userId, topicId, status: "opened" },
  });
}
