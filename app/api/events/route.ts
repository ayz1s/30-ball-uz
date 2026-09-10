import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUserId } from "@/lib/auth";
import { getAppConfig } from "@/lib/config";
import { isRateLimited } from "@/lib/rate-limit";
import { logEvent } from "@/lib/analytics";

export const runtime = "nodejs";

// Только события, которые можно достоверно узнать лишь на клиенте
// (например, конец теста) — открытие темы и старт теста логируются
// на сервере в самих страницах, без лишнего запроса.
const bodySchema = z.object({
  type: z.enum(["quiz_finished"]),
  payload: z.record(z.string(), z.unknown()).optional(),
});

export async function POST(req: NextRequest) {
  const userId = await getCurrentUserId();

  const ip = req.headers.get("x-forwarded-for") ?? "unknown";
  if (isRateLimited(`events:${ip}`, 60, 60_000)) {
    return NextResponse.json({ error: "too_many_requests" }, { status: 429 });
  }

  const parsedBody = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsedBody.success) {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }

  const { key: appKey } = getAppConfig();
  await logEvent(appKey, userId, parsedBody.data.type, parsedBody.data.payload);

  return NextResponse.json({ ok: true });
}
