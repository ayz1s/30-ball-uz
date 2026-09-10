import { describe, it, expect } from "vitest";
import crypto from "crypto";
import { validateTelegramInitData } from "@/lib/telegram";

const BOT_TOKEN = "123456:TEST-TOKEN";

function signInitData(fields: Record<string, string>): string {
  const params = new URLSearchParams(fields);
  const dataCheckString = [...params.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}=${value}`)
    .join("\n");
  const secretKey = crypto.createHmac("sha256", "WebAppData").update(BOT_TOKEN).digest();
  const hash = crypto.createHmac("sha256", secretKey).update(dataCheckString).digest("hex");
  params.set("hash", hash);
  return params.toString();
}

describe("validateTelegramInitData", () => {
  const user = JSON.stringify({ id: 42, first_name: "Anvar", language_code: "uz" });

  it("принимает корректно подписанные данные", () => {
    const initData = signInitData({ auth_date: String(Math.floor(Date.now() / 1000)), user });
    const result = validateTelegramInitData(initData, BOT_TOKEN);
    expect(result.valid).toBe(true);
    if (result.valid) {
      expect(result.user.id).toBe(42);
      expect(result.user.first_name).toBe("Anvar");
    }
  });

  it("отклоняет данные с подменённым полем после подписи", () => {
    const initData = signInitData({ auth_date: String(Math.floor(Date.now() / 1000)), user });
    const tampered = initData.replace("Anvar", "Hacker");
    const result = validateTelegramInitData(tampered, BOT_TOKEN);
    expect(result.valid).toBe(false);
  });

  it("отклоняет данные, подписанные чужим токеном", () => {
    const initData = signInitData({ auth_date: String(Math.floor(Date.now() / 1000)), user });
    const result = validateTelegramInitData(initData, "999999:OTHER-TOKEN");
    expect(result.valid).toBe(false);
  });

  it("отклоняет устаревший initData", () => {
    const oldDate = Math.floor(Date.now() / 1000) - 60 * 60 * 25; // 25 часов назад
    const initData = signInitData({ auth_date: String(oldDate), user });
    const result = validateTelegramInitData(initData, BOT_TOKEN);
    expect(result.valid).toBe(false);
  });

  it("отклоняет данные без подписи", () => {
    const result = validateTelegramInitData(`user=${encodeURIComponent(user)}`, BOT_TOKEN);
    expect(result.valid).toBe(false);
  });
});
