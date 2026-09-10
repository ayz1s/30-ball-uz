import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { getCurrentUserId } from "@/lib/auth";
import { isRateLimited } from "@/lib/rate-limit";

export const runtime = "nodejs";

const bodySchema = z.object({
  topicId: z.string().min(1),
  status: z.enum(["done", "known"]),
});

export async function POST(req: NextRequest) {
  const userId = await getCurrentUserId();
  if (!userId) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const ip = req.headers.get("x-forwarded-for") ?? "unknown";
  if (isRateLimited(`progress:${ip}`, 60, 60_000)) {
    return NextResponse.json({ error: "too_many_requests" }, { status: 429 });
  }

  const parsedBody = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsedBody.success) {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }

  const { topicId, status } = parsedBody.data;
  const topic = await db.topic.findUnique({ where: { id: topicId }, select: { id: true } });
  if (!topic) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  await db.progress.upsert({
    where: { userId_topicId: { userId, topicId } },
    update: { status, doneAt: status === "done" ? new Date() : undefined },
    create: { userId, topicId, status, doneAt: status === "done" ? new Date() : null },
  });

  return NextResponse.json({ ok: true });
}
