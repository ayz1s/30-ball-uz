import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { getCurrentUserId } from "@/lib/auth";
import { isRateLimited } from "@/lib/rate-limit";

export const runtime = "nodejs";

const bodySchema = z.object({
  locale: z.enum(["ru", "uz"]),
});

export async function POST(req: NextRequest) {
  const userId = await getCurrentUserId();
  if (!userId) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const ip = req.headers.get("x-forwarded-for") ?? "unknown";
  if (isRateLimited(`locale:${ip}`, 20, 60_000)) {
    return NextResponse.json({ error: "too_many_requests" }, { status: 429 });
  }

  const parsedBody = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsedBody.success) {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }

  await db.user.update({
    where: { id: userId },
    data: { languageCode: parsedBody.data.locale },
  });

  return NextResponse.json({ ok: true });
}
