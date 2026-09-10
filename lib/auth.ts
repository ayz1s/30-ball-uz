import { cookies } from "next/headers";
import { db } from "@/lib/db";
import { getAppConfig } from "@/lib/config";
import type { TelegramUser } from "@/lib/telegram";

export const SESSION_COOKIE = "session_uid";

// Кука хранит только внутренний cuid пользователя, не telegramId — сама по
// себе бесполезна без доступа к базе, и мы никогда не кладём в неё права
// доступа (раздел 8.2 ТЗ: права определяются только на сервере).
const SESSION_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: true,
  sameSite: "none" as const, // мини-апп открывается внутри Telegram (iframe), Lax/Strict куку обрежут
  path: "/",
  maxAge: 60 * 60 * 24 * 365,
};

export async function getCurrentUserId(): Promise<string | null> {
  const store = await cookies();
  return store.get(SESSION_COOKIE)?.value ?? null;
}

// Находит или создаёт пользователя для ТЕКУЩЕГО приложения (appKey) по
// данным, уже проверенным validateTelegramInitData, и открывает сессию.
export async function createSessionForTelegramUser(tgUser: TelegramUser) {
  const { key: appKey } = getAppConfig();

  const user = await db.user.upsert({
    where: { appKey_telegramId: { appKey, telegramId: BigInt(tgUser.id) } },
    update: {
      firstName: tgUser.first_name,
      languageCode: tgUser.language_code ?? "uz",
      lastSeenAt: new Date(),
    },
    create: {
      appKey,
      telegramId: BigInt(tgUser.id),
      firstName: tgUser.first_name,
      languageCode: tgUser.language_code ?? "uz",
    },
  });

  const store = await cookies();
  store.set(SESSION_COOKIE, user.id, SESSION_COOKIE_OPTIONS);

  return user;
}

// Пользователь текущего запроса — только по данным из базы, никогда по
// тому, что прислал клиент напрямую.
export async function getCurrentUser() {
  const userId = await getCurrentUserId();
  if (!userId) return null;
  return db.user.findUnique({ where: { id: userId } });
}
