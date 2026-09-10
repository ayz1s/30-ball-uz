"use client";

import { useState } from "react";
import Link from "next/link";
import type { QuizQuestion } from "@/lib/quiz";
import { BottomNav } from "@/components/bottom-nav";
import { t, type Locale } from "@/lib/i18n";
import { now } from "@/lib/time";

interface QuizResult {
  question: QuizQuestion;
  chosenIdx: number;
  correct: boolean;
}

export function QuizRunner({
  title,
  questions,
  locale,
  backHref,
}: {
  title: string;
  questions: QuizQuestion[];
  locale: Locale;
  backHref: string;
}) {
  const [index, setIndex] = useState(0);
  const [pickedIdx, setPickedIdx] = useState<number | null>(null);
  const [shownAt, setShownAt] = useState(() => now());
  const [results, setResults] = useState<QuizResult[]>([]);

  if (questions.length === 0) {
    return (
      <main className="flex min-h-dvh flex-col items-center justify-center gap-3 px-6 pb-20 text-center">
        <p className="text-sm text-neutral-500">{t(locale, "quizEmpty")}</p>
        <Link href={backHref} className="text-sm text-blue-600">
          {t(locale, "backToTests")}
        </Link>
        <BottomNav locale={locale} />
      </main>
    );
  }

  if (index >= questions.length) {
    const correctCount = results.filter((r) => r.correct).length;
    const mistakes = results.filter((r) => !r.correct);
    return (
      <main className="min-h-dvh px-6 py-8 pb-24">
        <h1 className="text-lg font-semibold text-neutral-900">{t(locale, "quizFinishedTitle")}</h1>
        <p className="mt-2 text-neutral-700">
          {t(locale, "quizScore", { correct: String(correctCount), total: String(results.length) })}
        </p>

        {mistakes.length > 0 && (
          <div className="mt-4 space-y-2">
            {mistakes.map((r) => (
              <div key={r.question.id} className="rounded-xl border border-red-100 bg-red-50 p-3 text-sm">
                <p className="font-medium text-red-900">{r.question.text}</p>
                <p className="mt-1 text-red-800">{r.question.explanation}</p>
              </div>
            ))}
          </div>
        )}

        <Link
          href={backHref}
          className="mt-6 block rounded-xl bg-blue-600 py-3 text-center text-sm font-medium text-white"
        >
          {t(locale, "backToTests")}
        </Link>
        <BottomNav locale={locale} />
      </main>
    );
  }

  const question = questions[index];

  function pick(i: number) {
    if (pickedIdx !== null) return;
    setPickedIdx(i);
    const correct = i === question.correctIdx;
    const ms = now() - shownAt;
    setResults((prev) => [...prev, { question, chosenIdx: i, correct }]);
    fetch("/api/attempts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ questionId: question.id, chosenIdx: i, ms }),
    }).catch(() => {});
  }

  function next() {
    setIndex((i) => i + 1);
    setPickedIdx(null);
    setShownAt(now());
  }

  return (
    <main className="min-h-dvh px-6 py-8 pb-24">
      <p className="text-sm text-neutral-500">
        {title} · {index + 1}/{questions.length}
      </p>
      <div className="mt-4 space-y-3 rounded-xl border border-neutral-200 p-4">
        <p className="font-medium text-neutral-900">{question.text}</p>
        <div className="grid gap-2">
          {question.options.map((option, i) => (
            <button
              key={i}
              type="button"
              disabled={pickedIdx !== null}
              onClick={() => pick(i)}
              className={`min-h-12 rounded-lg px-4 py-3 text-left text-sm font-medium ${
                pickedIdx === i
                  ? i === question.correctIdx
                    ? "bg-green-100 text-green-900"
                    : "bg-red-100 text-red-900"
                  : pickedIdx !== null && i === question.correctIdx
                    ? "bg-green-100 text-green-900"
                    : "bg-neutral-100 text-neutral-800"
              }`}
            >
              {option}
            </button>
          ))}
        </div>
        {pickedIdx !== null && <p className="text-sm text-neutral-600">{question.explanation}</p>}
      </div>

      {pickedIdx !== null && (
        <button
          type="button"
          onClick={next}
          className="mt-4 w-full rounded-xl bg-blue-600 py-3 text-sm font-medium text-white"
        >
          {index + 1 < questions.length ? t(locale, "nextQuestion") : t(locale, "finishQuiz")}
        </button>
      )}

      <BottomNav locale={locale} />
    </main>
  );
}
