import { getAppConfigByKey, type AppConfig } from "@/apps.config";

let cached: AppConfig | null = null;

export function getAppConfig(): AppConfig {
  if (cached) return cached;
  const key = process.env.NEXT_PUBLIC_APP_KEY;
  if (!key) {
    throw new Error("NEXT_PUBLIC_APP_KEY не задан. Добавьте его в .env.local.");
  }
  cached = getAppConfigByKey(key);
  return cached;
}
