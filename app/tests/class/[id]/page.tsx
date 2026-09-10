import { getCurrentUser } from "@/lib/auth";
import { getClassQuestions } from "@/lib/quiz";
import { QuizRunner } from "@/components/quiz-runner";
import { t, type Locale } from "@/lib/i18n";

export default async function ClassTestPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getCurrentUser();
  const locale: Locale = user?.languageCode === "ru" ? "ru" : "uz";

  const klass = await getClassQuestions(id);

  if (!klass) {
    return (
      <main className="flex min-h-dvh flex-col items-center justify-center px-6 text-center">
        <p className="text-sm text-neutral-500">{t(locale, "classNotFound")}</p>
      </main>
    );
  }

  return <QuizRunner title={klass.title} questions={klass.questions} locale={locale} backHref="/tests" />;
}
