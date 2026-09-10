import { db } from "@/lib/db";
import { Prisma } from "@prisma/client";

export type AnalyticsEventType = "topic_opened" | "topic_closed" | "quiz_started" | "quiz_finished";

// Аналитика не должна мешать основному запросу (раздел 9 ТЗ) — падение
// записи события никогда не должно превращаться в ошибку для пользователя.
export async function logEvent(
  appKey: string,
  userId: string | null,
  type: AnalyticsEventType,
  payload?: Record<string, unknown>,
) {
  try {
    await db.analyticsEvent.create({
      data: { appKey, userId, type, payload: payload as Prisma.InputJsonValue | undefined },
    });
  } catch (error) {
    console.error("Не удалось записать событие аналитики:", type, error);
  }
}
