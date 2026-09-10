import { getAppConfig } from "@/lib/config";
import { getCurrentUser } from "@/lib/auth";
import { getAllQuestions } from "@/lib/quiz";
import { QuizRunner } from "@/components/quiz-runner";
import { t, type Locale } from "@/lib/i18n";

export default async function FullTestPage() {
  const { key: appKey } = getAppConfig();
  const user = await getCurrentUser();
  const locale: Locale = user?.languageCode === "ru" ? "ru" : "uz";

  const questions = await getAllQuestions(appKey);

  return (
    <QuizRunner title={t(locale, "testsFullTitle")} questions={questions} locale={locale} backHref="/tests" />
  );
}
