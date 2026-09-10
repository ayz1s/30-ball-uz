export type Locale = "ru" | "uz";

const dictionaries = {
  ru: {
    loading: "Загружаем…",
    greeting: "Привет, {name}!",
    homePlaceholder: "Это заготовка главного экрана — этап 1 каркаса.",
    authError: "Не удалось войти. Проверьте связь и откройте приложение заново.",
    openInTelegramTitle: "Откройте в Telegram",
    openInTelegramBody: "Это приложение работает только внутри Telegram — откройте его через бота.",
    tabTheory: "Теория",
    tabScheme: "Схема",
    tabCards: "Карточки",
    tabQuestions: "Вопросы",
    tabEmpty: "В этой теме пока нет материала для этой вкладки.",
    questionExplanation: "Пояснение",
    topicNotFound: "Тема не найдена или ещё не опубликована.",
  },
  uz: {
    loading: "Yuklanmoqda…",
    greeting: "Salom, {name}!",
    homePlaceholder: "Bu bosh ekranning qoralamasi — 1-bosqich.",
    authError: "Kirib bo‘lmadi. Aloqani tekshirib, ilovani qayta oching.",
    openInTelegramTitle: "Telegram orqali oching",
    openInTelegramBody: "Bu ilova faqat Telegram ichida ishlaydi — uni bot orqali oching.",
    tabTheory: "Nazariya",
    tabScheme: "Sxema",
    tabCards: "Kartochkalar",
    tabQuestions: "Savollar",
    tabEmpty: "Bu mavzuda hozircha bu bo‘lim uchun material yo‘q.",
    questionExplanation: "Izoh",
    topicNotFound: "Mavzu topilmadi yoki hali e’lon qilinmagan.",
  },
} satisfies Record<Locale, Record<string, string>>;

type DictKey = keyof (typeof dictionaries)["ru"];

export function t(locale: Locale, key: DictKey, vars?: Record<string, string>): string {
  let str = dictionaries[locale]?.[key] ?? dictionaries.ru[key];
  if (vars) {
    for (const [name, value] of Object.entries(vars)) {
      str = str.replace(`{${name}}`, value);
    }
  }
  return str;
}
