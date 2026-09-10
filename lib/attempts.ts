import { db } from "@/lib/db";

export async function recordAttempt(userId: string, questionId: string, chosenIdx: number, ms: number) {
  const question = await db.question.findUnique({ where: { id: questionId }, select: { correctIdx: true } });
  if (!question) return null;

  const correct = chosenIdx === question.correctIdx;
  await db.attempt.create({ data: { userId, questionId, chosenIdx, correct, ms } });

  // Разбор ошибок (раздел 7 ТЗ): верный повторный ответ закрывает открытую
  // ошибку, неверный — создаёт её или увеличивает счётчик повторов.
  if (correct) {
    await db.errorItem.updateMany({
      where: { userId, questionId, status: "open" },
      data: { status: "fixed", fixedAt: new Date() },
    });
  } else {
    await db.errorItem.upsert({
      where: { userId_questionId: { userId, questionId } },
      update: { status: "open", wrongCount: { increment: 1 }, fixedAt: null },
      create: { userId, questionId, status: "open", wrongCount: 1 },
    });
  }

  return { correct };
}
