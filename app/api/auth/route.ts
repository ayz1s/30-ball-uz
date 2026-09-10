import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { validateTelegramInitData } from "@/lib/telegram";
import { createSessionForTelegramUser } from "@/lib/auth";
import { isRateLimited } from "@/lib/rate-limit";

export const runtime = "nodejs";

const bodySchema = z.object({
  initData: z.string().min(1),
});

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for") ?? "unknown";
  if (isRateLimited(`auth:${ip}`, 20, 60_000)) {
    return NextResponse.json({ error: "too_many_requests" }, { status: 429 });
  }

  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  if (!botToken) {
    console.error("TELEGRAM_BOT_TOKEN не задан");
    return NextResponse.json({ error: "server_misconfigured" }, { status: 500 });
  }

  const parsedBody = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsedBody.success) {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }

  const result = validateTelegramInitData(parsedBody.data.initData, botToken);
  if (!result.valid) {
    // Не пишем telegramId/имя в лог (раздел 8.7 ТЗ) — только причину отказа.
    console.warn("initData validation failed:", result.reason);
    return NextResponse.json({ error: "invalid_init_data" }, { status: 401 });
  }

  const user = await createSessionForTelegramUser(result.user);

  return NextResponse.json({
    firstName: user.firstName,
    languageCode: user.languageCode,
  });
}
