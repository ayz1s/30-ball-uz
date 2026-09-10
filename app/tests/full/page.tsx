import { getAppConfig } from "@/lib/config";
import { getCurrentUser } from "@/lib/auth";
import { getAllQuestions } from "@/lib/quiz";
import { logEvent } from "@/lib/analytics";
import { QuizRunner } from "@/components/quiz-runner";
import { t, type Locale } from "@/lib/i18n";

export default async function FullTestPage() {
  const { key: appKey } = getAppConfig();
  const user = await getCurrentUser();
  const locale: Locale = user?.languageCode === "ru" ? "ru" : "uz";

  const questions = await getAllQuestions(appKey);
  if (user) await logEvent(appKey, user.id, "quiz_started", { scope: "full" });

  return (
    <QuizRunner title={t(locale, "testsFullTitle")} questions={questions} locale={locale} backHref="/tests" />
  );
}
