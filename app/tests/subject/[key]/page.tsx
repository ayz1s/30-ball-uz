import { getAppConfig } from "@/lib/config";
import { getCurrentUser } from "@/lib/auth";
import { getSubjectQuestions } from "@/lib/quiz";
import { QuizRunner } from "@/components/quiz-runner";
import { t, type Locale } from "@/lib/i18n";

export default async function SubjectTestPage({ params }: { params: Promise<{ key: string }> }) {
  const { key } = await params;
  const { key: appKey } = getAppConfig();
  const user = await getCurrentUser();
  const locale: Locale = user?.languageCode === "ru" ? "ru" : "uz";

  const subject = await getSubjectQuestions(appKey, key);

  if (!subject) {
    return (
      <main className="flex min-h-dvh flex-col items-center justify-center px-6 text-center">
        <p className="text-sm text-neutral-500">{t(locale, "subjectNotFound")}</p>
      </main>
    );
  }

  return <QuizRunner title={subject.title} questions={subject.questions} locale={locale} backHref="/tests" />;
}
