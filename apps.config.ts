export type AppKey = "ball30uz";

export interface AppPalette {
  primary: string;
  primaryForeground: string;
  accent: string;
}

export interface AppSubjectSlot {
  // Должен совпадать с Subject.key в базе для этого appKey.
  key: string;
}

export interface AppConfig {
  key: AppKey;
  name: { ru: string; uz: string };
  palette: AppPalette;
  subjects: AppSubjectSlot[];
  botUsername: string;
  // ISO-дата вступительного экзамена — для отсчёта дней на главном экране.
  // TODO(этап 6): перенести в админку, чтобы менять без деплоя.
  examDate: string;
}

const apps = {
  ball30uz: {
    key: "ball30uz",
    name: { ru: "30 ball.uz", uz: "30 ball.uz" },
    palette: {
      primary: "#2563eb",
      primaryForeground: "#ffffff",
      accent: "#eff6ff",
    },
    subjects: [{ key: "math" }, { key: "hist" }, { key: "lang" }],
    botUsername: "REPLACE_ME_bot",
    examDate: "2027-08-01",
  },
} satisfies Record<AppKey, AppConfig>;

export function getAppConfigByKey(key: string): AppConfig {
  const config = (apps as Record<string, AppConfig>)[key];
  if (!config) {
    throw new Error(
      `Неизвестный appKey "${key}". Добавьте его в apps.config.ts или проверьте NEXT_PUBLIC_APP_KEY.`,
    );
  }
  return config;
}
