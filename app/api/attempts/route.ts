import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUserId } from "@/lib/auth";
import { isRateLimited } from "@/lib/rate-limit";
import { recordAttempt } from "@/lib/attempts";

export const runtime = "nodejs";

const bodySchema = z.object({
  questionId: z.string().min(1),
  chosenIdx: z.number().int().min(0),
  ms: z.number().int().min(0).max(10 * 60 * 1000),
});

export async function POST(req: NextRequest) {
  const userId = await getCurrentUserId();
  if (!userId) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const ip = req.headers.get("x-forwarded-for") ?? "unknown";
  if (isRateLimited(`attempt:${ip}`, 120, 60_000)) {
    return NextResponse.json({ error: "too_many_requests" }, { status: 429 });
  }

  const parsedBody = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsedBody.success) {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }

  const { questionId, chosenIdx, ms } = parsedBody.data;
  const result = await recordAttempt(userId, questionId, chosenIdx, ms);
  if (!result) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  return NextResponse.json({ ok: true, correct: result.correct });
}
