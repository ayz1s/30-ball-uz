import crypto from "crypto";
import { z } from "zod";

const telegramUserSchema = z.object({
  id: z.number(),
  first_name: z.string(),
  language_code: z.string().optional(),
});

export type TelegramUser = z.infer<typeof telegramUserSchema>;

// Сколько может быть "старым" initData, прежде чем мы откажем в запросе —
// защита от повторного использования однажды перехваченной строки initData.
const MAX_INIT_DATA_AGE_SECONDS = 24 * 60 * 60;

// Проверка подписи Telegram WebApp initData на сервере — без этого любой
// может прислать поддельные данные и представиться чужим пользователем.
// Алгоритм: https://core.telegram.org/bots/webapps#validating-data-received-via-the-mini-app
export function validateTelegramInitData(
  initData: string,
  botToken: string,
): { valid: true; user: TelegramUser } | { valid: false; reason: string } {
  const params = new URLSearchParams(initData);
  const hash = params.get("hash");
  if (!hash) return { valid: false, reason: "no-hash" };
  params.delete("hash");

  const dataCheckString = [...params.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}=${value}`)
    .join("\n");

  const secretKey = crypto.createHmac("sha256", "WebAppData").update(botToken).digest();
  const computedHash = crypto.createHmac("sha256", secretKey).update(dataCheckString).digest("hex");

  const validSignature =
    computedHash.length === hash.length &&
    crypto.timingSafeEqual(Buffer.from(computedHash, "hex"), Buffer.from(hash, "hex"));
  if (!validSignature) return { valid: false, reason: "bad-signature" };

  const authDate = Number(params.get("auth_date"));
  if (!authDate || Date.now() / 1000 - authDate > MAX_INIT_DATA_AGE_SECONDS) {
    return { valid: false, reason: "expired" };
  }

  const userJson = params.get("user");
  if (!userJson) return { valid: false, reason: "no-user" };

  const parsedUser = telegramUserSchema.safeParse(JSON.parse(userJson));
  if (!parsedUser.success) return { valid: false, reason: "bad-user" };

  return { valid: true, user: parsedUser.data };
}
